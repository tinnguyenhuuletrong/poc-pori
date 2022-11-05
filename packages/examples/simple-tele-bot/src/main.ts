import * as MongoDataStore from '@pori-and-friends/mongodb-data-store';
import {
  Auto,
  Cmds,
  Computed,
  expandEngadedMission,
  getKyberPoolRIGYPrice,
  getKyberPoolRIKENPrice,
  getMaticBalance,
  getTokenBalance,
  init,
  queryBinancePrice,
  queryMarketInfo,
  token2Usd,
} from '@pori-and-friends/pori-actions';
import {
  AdventureInfoEx,
  Context,
  ENV,
  getDatastoreBackupKey,
  getMarketplayBaseLink,
  getMobileWalletApplink,
  getRIGYTokenInfo,
  getRIKENTokenInfo,
  TEN_POWER_10_BN,
} from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import { decryptAes, waitForMs } from '@pori-and-friends/utils';
import {
  copyFileSync,
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import moment from 'moment';
import TelegramBot, {
  InlineKeyboardButton,
  ParseMode,
} from 'node-telegram-bot-api';
import * as os from 'os';
import process from 'process';
import {
  activeEnv,
  botMasterUid,
  env,
  RuntimeConfig,
  playerAddress,
  VERSION,
} from './app/config';
import {
  addWorkerTaskForMineAtkNotify,
  addWorkerTaskForMineEndNotify,
  registerWorkerNotify,
} from './app/worker';

interface BotMemoryStructure {
  activeChats: string[];
}

let Memory: BotMemoryStructure;
function captureChatId(chatId) {
  if (!Memory.activeChats.includes(chatId)) {
    Memory.activeChats.push(chatId);
    saveBotMemory();
  }
}

let appCtx!: Context;

async function main() {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) {
    console.error('missing env TELEGRAM_TOKEN');
    return process.exit(1);
  }

  if (!botMasterUid) {
    console.error('missing env TELEGRAM_MASTER_ID');
    return process.exit(1);
  }

  console.log('🤖 booting step 1 done');
  const bootInfo = await boot();
  const { ctx, scheduler } = bootInfo;
  let realm = bootInfo.realm;

  async function reloadRealm() {
    realm = await Repos.openRepo({
      path: activeEnv.environment.dbPath,
    });
  }

  loadBotMemory();

  console.log('🤖 booting step 2 done');

  const bot = new TelegramBot(token, { polling: true });
  bot.on('polling_error', console.log);

  // mongodb data store
  if (activeEnv.environment.mongodbDataStoreUri) {
    MongoDataStore.addMongodbDataStore(
      ctx,
      activeEnv.environment.mongodbDataStoreUri,
      activeEnv.environment.mongodbDataStoreSSLCer
    ).then((res) => {
      ctx.ui.writeMessage('🤖 mongodb datastore connected!');
      const chatId = Memory.activeChats[0];
      if (chatId) doFetchSnapshotDb(bot, parseInt(chatId), ctx, realm);
    });
  }

  // worker register
  registerWorkerNotify({ ctx, realm, scheduler, bot });

  // extend ctx UI
  // register send msg, edit msg
  ctx.ui.writeMessage = async (msg, mode) => {
    const chatId = Memory.activeChats[0];
    if (chatId) {
      if (!mode) return await bot.sendMessage(chatId, msg);
      else
        return await bot.sendMessage(chatId, msg, {
          parse_mode: mode as ParseMode,
        });
    }
  };

  ctx.ui.editMessage = async (lastMsg, msg) => {
    const msgInfo = lastMsg as TelegramBot.Message;
    if (msgInfo) {
      await bot.editMessageText(msg, {
        chat_id: msgInfo.chat.id,
        message_id: msgInfo.message_id,
      });
    }
  };

  appCtx = ctx;

  // --------------------
  // cmds begin
  // --------------------

  bot.onText(/\/whoami/, async function whoami(msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    // console.log(msg);
    const localMetadata = await getLocalRealmRevision(realm);

    const resp = `i am 🤖. 
    <pre><code class="language-json">
      isMaster: ${msg.from.id.toString() === botMasterUid}
      masterUid: ${botMasterUid}
      uptime: ${process.uptime()}
      pid: ${process.pid}
      hostname: ${os.hostname()}
      playerAddress: ${playerAddress}
      walletUnlock: ${Boolean(ctx.walletAcc)}
      settingGasFactor: ${ctx.setting.gasFactor} 
      realmRevision: ${localMetadata.revision}
      env: ${env}
      _v: ${VERSION}
    </code></pre>
    Have fun!
    `;
    bot.sendMessage(msg.chat.id, resp, { parse_mode: 'HTML' });
  });

  bot.onText(/\/clear/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    await bot.sendMessage(msg.chat.id, 'clear...', {
      reply_markup: { remove_keyboard: true },
    });
  });

  bot.onText(/\/exit/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    await bot.sendMessage(msg.chat.id, 'shutdown... in next 2 sec', {
      reply_markup: { remove_keyboard: true },
    });

    setTimeout(() => {
      process.exit(0);
    }, 2000);
  });

  bot.onText(/\/help/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    await bot.sendMessage(msg.chat.id, 'clear...', {
      reply_markup: {
        keyboard: [
          [
            { text: '/db_fetch' },
            { text: '/db_upload' },
            { text: '/sch_list' },
            { text: '/auto_list' },
          ],
          [{ text: '/auto_all' }, { text: '/setting_set_gas_factor 1.05' }],
          [
            { text: '/market_list' },
            { text: '/price' },
            { text: '/wallet_balance' },
            { text: '/whoami' },
          ],
          [{ text: '/stats' }],
        ],
        resize_keyboard: true,
      },
    });
  });

  bot.onText(/\/setting_set_gas_factor (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const args = parseFloat(match[1]);
      ctx.setting.gasFactor = args;

      ctx.ui.writeMessage(`update setting.gasFactor to ${args}`);
    });
  });

  bot.onText(/\/wallet_reset/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    ctx.walletAcc = null;

    // No longer need it
    // await bot.sendMessage(msg.chat.id, 'trying to reset wallet channel...');
    // ctx.walletConnectChannel = null;
    // await addWalletConnectToContext(
    //   ctx,
    //   activeEnv.environment.walletConnectSessionStoragePath
    // );
  });

  bot.onText(/\/wallet_balance/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    const rigyInfo = getRIGYTokenInfo(env);
    const rikenInfo = getRIKENTokenInfo(env);

    // eslint-disable-next-line prefer-const
    let [RIGY, RIKEN, MATIC, priceInfo] = await Promise.all([
      getTokenBalance({
        ctx,
        erc20Address: rigyInfo.tokenAddress,
        walletAddress: playerAddress,
      }),
      getTokenBalance({
        ctx,
        erc20Address: rikenInfo.tokenAddress,
        walletAddress: playerAddress,
      }),
      getMaticBalance({ ctx, walletAddress: playerAddress }),
      token2Usd(ctx),
    ]);

    if (ctx.env === ENV.ProdPorichain) {
      RIGY = MATIC;
      MATIC = 0;
    }

    bot.sendMessage(
      msg.chat.id,
      `#balance
      <pre><code class="language-json">${JSON.stringify(
        {
          MATIC,
          RIGY,
          RIKEN,
          RigyUsd: RIGY * priceInfo.rigy2Usd,
          RikenUsd: RIKEN * priceInfo.rken2Usd,
        },
        null,
        2
      )}</code></pre>`,
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/\/wallet_unlock (.+)/, async function (msg, match) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    if (!existsSync(activeEnv.environment.aesKeyPath)) {
      await bot.sendMessage(
        msg.chat.id,
        'key not found. Please generate a new key + rebuild docker img...'
      );
      return;
    }
    const keyObj = JSON.parse(
      readFileSync(activeEnv.environment.aesKeyPath).toString()
    );
    const key = Buffer.from(keyObj.key, 'hex');
    const iv = Buffer.from(keyObj.iv, 'hex');
    let privKey = '';
    try {
      const encrypted = match[1];
      privKey = await decryptAes({ key, iv, encrypted });
    } catch (error) {
      await bot.sendMessage(msg.chat.id, 'decrypt error...');
      return;
    }

    try {
      const acc = ctx.web3.eth.accounts.privateKeyToAccount(privKey);
      if (acc.address !== playerAddress)
        throw new Error('not match playerAddress...');

      ctx.walletAcc = acc;
    } catch (error) {
      await bot.sendMessage(msg.chat.id, error.message);
      return;
    }

    await bot.sendMessage(msg.chat.id, 'wallet unlocked..');
    await bot.deleteMessage(msg.chat.id, msg.message_id.toString());
  });

  bot.onText(/\/stats/, async (msg, match) => {
    await withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const addr = playerAddress;
      await bot.sendMessage(msg.chat.id, 'refreshing....');
      const humanView =
        await Computed.MyAdventure.refreshAdventureStatsForAddress(
          {
            realm,
            ctx,
            options: { withGasPrice: true, withPortal: true, withPrice: true },
          },
          addr
        );

      const chartIncomLast7Days =
        await Computed.MyAdventure.genLast7DaysGraphData({
          ctx,
          realm,
          playerAddress: addr,
        });

      const localMetadata = await getLocalRealmRevision(realm);

      // targets:
      // ${humanView.protentialTarget.map(
      //   (itm) => `\n\t \\- ${itm.mineId} ${itm.hasBigReward} ${itm.sinceSec}`
      // )}

      const protentialTarget = humanView.protentialTarget;
      const mines = Object.values(humanView.mines);
      const adventureRender = (inp: AdventureInfoEx) => {
        const appLink = getMobileWalletApplink(env, inp.link);
        return `  * <a href="${appLink}">${inp.mineId}</a>
          - supporterAddr: ${inp.supporterAddress}
          - blockTo: ${inp.blockedTo.toLocaleString()}
          - supportTime: ${inp.atkAt.toLocaleString()}
          - hasBigReward: ${inp.hasBigReward}
          - isFarmer: ${inp.isFarmer}
          - farmerRewardLevel: ${inp.farmerRewardLevel?.join(',')}
          - supporterRewardLevel: ${inp.supporterRewardLevel?.join(',')}
        `;
      };

      const resp = `
<b>Mines:</b>      
${mines.map((itm) => adventureRender(itm)).join('\n')}
<b>Targets:</b>
${protentialTarget
  .slice(0, 5)
  .filter((itm) => !!itm)
  .map(
    (itm) =>
      `\t\t - ${itm.mineId} bigReward-${itm.hasBigReward} since-${itm.sinceSec} sec`
  )
  .join('\n')}
<b>Summary:</b>
  - <i>revision: </i> <b>${localMetadata.revision}</b>
  - <i>canDoNextAction: </i> <b>${humanView.canDoNextAction}</b>
  - <i>activeMine: </i> ${humanView.activeMines}
  - <i>nextSupportAt: </i> ${humanView.nextAtkAt}
  - <i>nextActionAt: </i> ${humanView.nextActionAt}
  - <i>gasPriceGWEI: </i> ${humanView.gasPriceGWEI}
  - <i>portalInfo: </i> available/supplied: ${
    humanView.portalInfo?.availableRiken
  }/${humanView.portalInfo?.suppliedRiken}, nextMissionRequire: ${
        humanView.portalInfo?.nextMissionRequireRiken
      }

<b>Today:</b>
  - <i>day: </i> ${new Date(
    humanView.todayStats?.timestamp
  ).toLocaleDateString()}
  - <i>mines: </i> ${humanView.todayStats?.finishedMineIds.length}
  - <i>RIGY: </i> ${humanView.todayStats?.totalRigy}
  - <i>RIKEN: </i> ${humanView.todayStats?.totalRiken}
  - <i>RIGY$: </i> ${humanView.todayStats?.rigyUsd}
  - <i>RIKEN$: </i> ${humanView.todayStats?.rikenUsd}


<b>Charts:</b>
  - <a href="${chartIncomLast7Days.url}">RIGYLast7Days</a>

      `;

      let keyboardActions: InlineKeyboardButton[] = [];
      const hasPortal = canUsePortal(humanView);

      keyboardActions = protentialTarget.slice(0, 5).map((itm) => {
        return {
          text: `${itm.mineId} - ${itm.hasBigReward ? 1 : 0}`,
          switch_inline_query_current_chat: hasPortal
            ? `/atk ${itm.mineId} 1`
            : `/atk ${itm.mineId} 0`,
        };
      });
      const newMineAction: InlineKeyboardButton = {
        text: `new mine`,
        switch_inline_query_current_chat: hasPortal ? `/mine 1` : `/mine 0`,
      };

      const keyboard = humanView.canDoNextAction
        ? [keyboardActions, [newMineAction]]
        : undefined;

      // capture and send end notification
      captureNotificationForMyMine(mines, msg);

      await bot.sendMessage(msg.chat.id, 'finish....');
      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    });
  });

  bot.onText(/\/finish (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const args = match[1];
      await Cmds.cmdDoFinish({ ctx, realm, args });
    });
  });

  bot.onText(/\/auto_all/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      if (!ctx.walletAcc)
        return bot.sendMessage(
          msg.chat.id,
          `please call /wallet_unlock <.enveloped_key..> frist`
        );

      const botMonitorDb: any = {};

      // update bot formations here
      for await (const iterator of RuntimeConfig.formations) {
        const startFunc = async () =>
          await Auto.autoPlayV1({
            ctx,
            realm,
            playerAddress,
            args: {
              type: 'bot',
              minePories: iterator.minePories,
              supportPori: iterator.supportPori,
              timeOutHours: RuntimeConfig.settings.botTimeoutHours,
              usePortal: iterator.usePortal,
            },
          });

        const st = await startFunc();
        botMonitorDb[st.id] = startFunc;

        await waitForMs(20000);
      }

      // background update db
      await Auto.autoRefreshStatus({
        ctx,
        realm,
        playerAddress,
        args: { type: 'background_refresh', intervalMs: 2 * 60 * 1000 },
      });

      // monitor items
      await Auto.autoMonitorMarketItemPrices({
        ctx,
        realm,
        args: {
          type: 'market_items_monitor',
          intervalMs: 5 * 60 * 1000,
          minSeedToNotice: 1500,
          minPotionToNotice: 2000,
        },
      });

      // keepAliveBot
      await Auto.autoKeepAliveBot({
        ctx,
        realm,
        args: {
          type: 'keep_alive_bot',
          intervalMs: 30 * 60 * 1000, // every 30 mins
          botDb: botMonitorDb,
        },
      });
    });
  });

  bot.onText(/\/auto_list/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const allRunningBots = Object.entries(Auto.AutoPlayDb).map(
        (itm) => itm[1]
      );
      const resp = allRunningBots
        .map((itm) => {
          const args = itm.args;

          switch (args.type) {
            case 'bot': {
              const endAt = new Date(
                itm.state.startAt.valueOf() + args.timeOutHours * 60 * 60 * 1000
              );

              return `  * bot : ${itm.state.id}
                startAt: ${itm.state.startAt.toLocaleString()}
                endAt: ${endAt.toLocaleString()}
                `;
            }
            case 'background_refresh': {
              return `  * background_refresh : ${itm.state.id} 
                interval: - ${args.intervalMs} ms
                it: - ${itm.state.data['_it']} times
                nextAt: - ${moment(itm.state.data['_nextAt']).fromNow()} 
                `;
            }
            case 'market_items_monitor': {
              return `  * background_refresh : ${itm.state.id} 
              interval: - ${args.intervalMs} ms
              it: - ${itm.state.data['_it']} times
              nextAt: - ${moment(itm.state.data['_nextAt']).fromNow()} 
              minSeedToNotice: - ${args.minSeedToNotice}
              minPotionToNotice: - ${args.minPotionToNotice}
              `;
            }
            case 'keep_alive_bot': {
              return `  * background_refresh : ${itm.state.id} 
              interval: - ${args.intervalMs} ms
              nextAt: - ${moment(itm.state.data['_nextAt']).fromNow()} 
              monitor: - ${Object.keys(args.botDb).join(', ')}
              `;
            }

            default:
              break;
          }
        })
        .join('\n');

      let keyboardActions: InlineKeyboardButton[] = [];
      keyboardActions = allRunningBots.map((itm) => {
        return {
          text: `del - ${itm.state.id}`,
          switch_inline_query_current_chat: `/auto_del ${itm.state.id}`,
        };
      });

      await bot.sendMessage(msg.chat.id, resp || 'empty', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [keyboardActions],
        },
      });
    });
  });

  bot.onText(/\/auto_del (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const botId = match[1];
      await Auto.stopBot(botId);

      bot.sendMessage(msg.chat.id, `jobId ${botId} deleted`);
    });
  });

  bot.onText(/\/sch_list/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const allPendingJobs = await scheduler.listPendingJob(realm);
      const resp = allPendingJobs
        .map((itm) => {
          return `  * ${itm._id} - ${
            itm.codeName
          } - ${itm.runAt.toLocaleString()} (${moment(itm.runAt).fromNow()})`;
        })
        .join('\n');

      let keyboardActions: InlineKeyboardButton[] = [];
      keyboardActions = allPendingJobs.map((itm) => {
        return {
          text: `del - ${itm._id}`,
          switch_inline_query_current_chat: `/sch_del ${itm._id}`,
        };
      });

      await bot.sendMessage(msg.chat.id, resp || 'empty', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [keyboardActions],
        },
      });
    });
  });

  bot.onText(/\/sch_del (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const jobId = match[1];
      await scheduler.deleteJob(realm, jobId);

      bot.sendMessage(msg.chat.id, `jobId ${jobId} deleted`);
    });
  });

  bot.onText(/\/price/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const rigyPoolInfo = await getKyberPoolRIGYPrice({ ctx });
      const rikenPoolInfo = await getKyberPoolRIKENPrice({ ctx });
      const [lunaBusd, maticBusd] = await Promise.all([
        queryBinancePrice({ ctx, pair: 'LUNABUSD' }),
        queryBinancePrice({ ctx, pair: 'MATICBUSD' }),
      ]);

      bot.sendMessage(
        msg.chat.id,
        `#price
        <pre><code class="language-json">${JSON.stringify(
          {
            ...rigyPoolInfo,
            ...rikenPoolInfo,
            'LUNA->BUSD': lunaBusd.price,
            'MATIC->BUSD': maticBusd.price,
          },
          null,
          2
        )}</code></pre>`,
        { parse_mode: 'HTML' }
      );
    });
  });

  bot.onText(/\/market_list/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const sellingItems = await queryMarketInfo({ ctx });
      const topItem = await expandEngadedMission({
        ctx,
        data: sellingItems.slice(0, 5),
      });
      const marketplaceBaseUrl = getMarketplayBaseLink(ctx.env);

      const formatedData = topItem.map((itm) => {
        const {
          tokenId,
          price,
          helpPower,
          minePower,
          numOfBreeds,
          maxOfBreeds,
          engagedMission,
        } = itm;
        return {
          tokenId,
          link: `${marketplaceBaseUrl}/pori/${tokenId}`,
          price: (BigInt(price) / TEN_POWER_10_BN).toString() + ' RIGY',
          minePower,
          helpPower,
          engagedMission,
          breed: `${numOfBreeds} / ${maxOfBreeds}`,
        };
      });

      const resp = `
<b>Top 5:</b>
${formatedData
  .map((itm) => {
    const {
      link,
      price,
      minePower,
      helpPower,
      breed,
      tokenId,
      engagedMission,
    } = itm;

    const baseAppLink = getMobileWalletApplink(env, link);
    const appLink = baseAppLink;
    return `  link: <a href="${appLink}">${tokenId}</a>
      - price: ${price}
      - minePower: ${minePower}
      - helpPower: ${helpPower}
      - breed: ${breed}
      - engagedMission: ${engagedMission}
    `;
  })
  .join('\n')}
`;

      await bot.sendMessage(msg.chat.id, resp, { parse_mode: 'HTML' });
    });
  });

  bot.onText(/\/db_fetch/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      await doFetchSnapshotDb(bot, msg.chat.id, ctx, realm);
    });
  });

  bot.onText(/\/db_upload/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const backupKey = getDatastoreBackupKey(env);
      const checkMsg = await bot.sendMessage(
        msg.chat.id,
        `🗄 ${backupKey} uploading...`
      );

      const remoteRevision = await doUploadSnapshot(realm, ctx);
      const localMetadata = await getLocalRealmRevision(realm);

      await bot.editMessageText(
        `🗄 uploaded ${backupKey}. remoteRevision:${remoteRevision}, localRevision:${localMetadata.revision}`,
        {
          chat_id: checkMsg.chat.id,
          message_id: checkMsg.message_id,
        }
      );
    });
  });

  bot.onText(/\/db_pull/, async (msg) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const backupKey = getDatastoreBackupKey(env);

      const checkMsg = await bot.sendMessage(
        msg.chat.id,
        `🗄 ${backupKey} - checking...`
      );

      const updateText = async (msg) => {
        await bot.editMessageText(`🗄 ${msg}`, {
          chat_id: checkMsg.chat.id,
          message_id: checkMsg.message_id,
        });
      };

      await MongoDataStore.waitForConnected(ctx);

      const tmpDir = './tmp/';
      if (!existsSync(tmpDir)) mkdirSync(tmpDir);

      const [fileMeta, dataStream] = await MongoDataStore.downloadBlob(
        ctx,
        backupKey
      );

      const totalBytes = fileMeta.length;
      let downloaded = 0;
      await updateText(`download begin. totalBytes ${totalBytes}`);
      dataStream.prependListener('data', async (chunk) => {
        downloaded += chunk.length;
        await updateText(`progress ${downloaded / totalBytes}`);
      });

      dataStream
        .pipe(createWriteStream('./tmp/snapshot.realm'))
        .on('finish', async () => {
          await updateText(`download finish. begin extract`);

          realm.close();
          copyFileSync('./tmp/snapshot.realm', activeEnv.environment.dbPath);

          await updateText(`extract success. reload realm begin`);
          await reloadRealm();

          await updateText('reload realm success');

          const localMetadata = await getLocalRealmRevision(realm);

          await updateText(`#datastore_sync ${localMetadata.revision}`);
        });
    });
  });

  // --------------------
  // cmd handler End
  // --------------------

  console.log('🤖 started');

  for (const id of Memory.activeChats) {
    await bot.sendMessage(id, `hi [master](tg://user?id=${botMasterUid}) 👋`, {
      parse_mode: 'MarkdownV2',
    });
  }

  function captureNotificationForMyMine(
    mines: AdventureInfoEx[],
    msg: TelegramBot.Message
  ) {
    const now = Date.now();
    for (const itm of mines) {
      // only register for unfinished mine
      if (!itm.canCollect)
        addWorkerTaskForMineEndNotify({
          ctx,
          realm,
          scheduler,
          chatId: msg.chat.id,
          mineId: itm.mineId,
          endAt: itm.blockedTo,
          pnMessage: `mine ${itm.mineId} end`,
          extra: {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `finish`,
                    switch_inline_query_current_chat: `/finish ${itm.mineId}`,
                  },
                ],
              ],
            },
          },
        });

      // register for can attak target
      if (itm.atkAt.valueOf() > now) {
        addWorkerTaskForMineAtkNotify({
          ctx,
          realm,
          scheduler,
          chatId: msg.chat.id,
          mineId: itm.mineId,
          endAt: itm.atkAt,
          pnMessage: `mine ${itm.mineId} can atk`,
          extra: {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `support`,
                    switch_inline_query_current_chat: `/support ${itm.mineId}`,
                  },
                ],
              ],
            },
          },
        });
      }
    }
  }

  function canUsePortal(humanView: {
    note: any;
    // my active adventures
    mines: Record<string, AdventureInfoEx>;
    // protential target
    targets: any;
    protentialTarget: any[];
    activeMines: number;
    canDoNextAction: boolean;
    nextActionAt: string;
    gasPriceGWEI: string;
  }) {
    return humanView.activeMines <= 0;
  }

  async function doUploadSnapshot(realm: Realm, ctx: Context) {
    realm.compact();

    const stream = createReadStream(activeEnv.environment.dbPath);
    const backupKey = getDatastoreBackupKey(env);

    console.log(`upload snapshot - ${backupKey}`);

    const dbMetadata = await Repos.IdleGameSCMetadataRepo.findOne(
      realm,
      'default'
    );
    const metadata = {
      revision: dbMetadata.updatedBlock,
    };

    await MongoDataStore.waitForConnected(ctx);

    await MongoDataStore.storeBlob(ctx, backupKey, stream, metadata);
    console.log(`uploaded - revision:${metadata.revision}`);
    return metadata.revision;
  }

  // --------
  // Cleanup
  async function close() {
    console.log('cleanup start');
    for (const id of Memory.activeChats) {
      await bot.sendMessage(id, 'bye 👋!');
    }

    console.log('bye 👋!');
  }
  process.once('SIGTERM', async () => {
    await close();
    appCtx.ui.writeMessage('recieved SIGTERM');
    process.exit(0);
  });
}

async function doFetchSnapshotDb(
  bot: TelegramBot,
  chatId: number,
  ctx: Context,
  realm: Realm
) {
  const backupKey = getDatastoreBackupKey(env);

  const checkMsg = await bot.sendMessage(
    chatId,
    `🗄 ${backupKey} - checking...`
  );

  await MongoDataStore.waitForConnected(ctx);

  const metadata = await MongoDataStore.fetchBolb(ctx, backupKey);

  const localMetadata = await getLocalRealmRevision(realm);

  const remoteRevision = metadata?.metadata?.revision;
  const shouldPull = remoteRevision > localMetadata.revision;

  await bot.editMessageText(
    `🗄 ${backupKey} - remoteRevision:${remoteRevision}, localRevision:${localMetadata.revision}
        - shouldPull: ${shouldPull}
        `,
    {
      chat_id: checkMsg.chat.id,
      message_id: checkMsg.message_id,
      reply_markup: {
        inline_keyboard: shouldPull
          ? [
              [
                {
                  text: `db_pull`,
                  switch_inline_query_current_chat: `/db_pull`,
                },
              ],
            ]
          : undefined,
      },
    }
  );
}

async function getLocalRealmRevision(realm: Realm) {
  const dbMetadata = await Repos.IdleGameSCMetadataRepo.findOne(
    realm,
    'default'
  );
  const localMetadata = {
    revision: dbMetadata?.updatedBlock ?? 0,
  };
  return localMetadata;
}

async function boot() {
  console.log(env, activeEnv);

  if (!playerAddress) {
    console.log('missing process.env.PLAYER_ADDRESS');
    process.exit(1);
  }
  console.log('PlayerAddress:', playerAddress);
  console.log('Example: cli');

  const ctx = await init(env);
  console.log('connected');

  ctx.playerAddress = playerAddress;

  // No longer need it
  // await addWalletConnectToContext(
  //   ctx,
  //   activeEnv.environment.walletConnectSessionStoragePath
  // );

  const realm = await Repos.openRepo({
    path: activeEnv.environment.dbPath,
  });
  const scheduler = new Repos.Services.SchedulerService();
  await scheduler.start(realm);

  return { realm, ctx, scheduler };
}

function requireBotMaster(msg: TelegramBot.Message) {
  return msg.from.id.toString() === botMasterUid;
}

function loadBotMemory() {
  if (
    activeEnv.environment.botMemoryPath &&
    existsSync(activeEnv.environment.botMemoryPath)
  ) {
    const data = readFileSync(activeEnv.environment.botMemoryPath).toString();
    Memory = JSON.parse(data);
    console.log(`🤖 - memory restore from activeEnv.environment.botMemoryPath`);
    return;
  }

  // Init default
  Memory = {
    activeChats: [],
  };
}

function saveBotMemory() {
  if (activeEnv.environment.botMemoryPath) {
    writeFileSync(activeEnv.environment.botMemoryPath, JSON.stringify(Memory));
    console.log(
      `🤖 - memory restore from ${activeEnv.environment.botMemoryPath}`
    );
  }
}

export async function withErrorWrapper(
  { chatId, bot }: { chatId: number; bot: TelegramBot },
  handler: () => Promise<any>
) {
  try {
    await handler();
  } catch (error: any) {
    console.error(error);
    await bot.sendMessage(chatId, `Error: ${error.message}`);
  }
}

process.on('uncaughtException', (err) => {
  console.log('got uncaughtException exit');
  appCtx.ui.writeMessage(`🤖 uncaughtException: ${err.message}`);
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log('got unhandledRejection exit');
  appCtx.ui.writeMessage(`🤖 unhandledRejection: ${(err as any).message}`);
  console.error(err);
  process.exit(1);
});

main();
