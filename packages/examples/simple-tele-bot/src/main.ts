import {
  addWalletConnectToContext,
  getKyberPoolRIGYPrice,
  getKyberPoolRIKENPrice,
  getMaticBalance,
  getTokenBalance,
  init,
  queryBinancePrice,
  queryMarketInfo,
  Computed,
  Cmds,
} from '@pori-and-friends/pori-actions';
import {
  AdventureInfoEx,
  Context,
  ENV,
  getRIGYTokenInfo,
  getRIKENTokenInfo,
  TEN_POWER_10_BN,
} from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import { decryptAes } from '@pori-and-friends/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import moment from 'moment';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import * as os from 'os';
import process from 'process';
import { autoPlayV1 } from './app/autoPlayWorkflow';
import {
  activeEnv,
  botMasterUid,
  env,
  FORMATION,
  MINE_ATK_PRICE_FACTOR,
  playerAddress,
  SUPPORT_PORI,
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
  const { ctx, realm, scheduler } = await boot();

  loadBotMemory();

  console.log('🤖 booting step 2 done');

  const bot = new TelegramBot(token, { polling: true });
  bot.on('polling_error', console.log);

  // worker register
  registerWorkerNotify({ ctx, realm, scheduler, bot });

  // extend ctx UI
  // register send msg
  ctx.ui.writeMessage = async (msg) => {
    const chatId = Memory.activeChats[0];
    await bot.sendMessage(chatId, msg);
  };

  appCtx = ctx;

  // --------------------
  // cmds begin
  // --------------------

  bot.onText(/\/whoami/, function whoami(msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    console.log(msg);

    const resp = `i am 🤖. 
    <pre><code class="language-json">
      isMaster: ${msg.from.id.toString() === botMasterUid}
      masterUid: ${botMasterUid}
      uptime: ${process.uptime()}
      pid: ${process.pid}
      hostname: ${os.hostname()}
      playerAddress: ${playerAddress}
      walletUnlock: ${Boolean(ctx.walletAcc)}
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
          [{ text: '/stats' }, { text: '/wallet_balance' }],
          [{ text: '/sch_list' }, { text: '/whoami' }],
          [{ text: '/finish' }, { text: '/price' }],
          [{ text: '/auto_play <h>' }, { text: '/market_list' }],
        ],
        resize_keyboard: true,
      },
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

    const [RIGY, RIKEN, MATIC] = await Promise.all([
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
    ]);

    bot.sendMessage(
      msg.chat.id,
      `#balance
      <pre><code class="language-json">${JSON.stringify(
        {
          MATIC,
          RIKEN,
          RIGY,
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
          { realm, ctx },
          addr
        );

      // targets:
      // ${humanView.protentialTarget.map(
      //   (itm) => `\n\t \\- ${itm.mineId} ${itm.hasBigReward} ${itm.sinceSec}`
      // )}

      const protentialTarget = humanView.protentialTarget;
      const mines = Object.values(humanView.mines);
      const adventureRender = (inp: AdventureInfoEx) => {
        const appLink = `https://link.trustwallet.com/open_url?url=${inp.link}&coin_id=966`;
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
  .map(
    (itm) =>
      `\t\t - ${itm.mineId} bigReward-${itm.hasBigReward} since-${itm.sinceSec} sec`
  )
  .join('\n')}
<b>Summary:</b>
  - <i>canDoNextAction: </i> <b>${humanView.canDoNextAction}</b>
  - <i>activeMine: </i> ${humanView.activeMines}
  - <i>nextSupportAt: </i> ${humanView.nextAtkAt}
  - <i>nextActionAt: </i> ${humanView.nextActionAt}
  - <i>gasPriceGWEI: </i> ${humanView.gasPriceGWEI}
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

      // capture and send end notification
      captureNotificationForMyMine(mines, msg);

      await bot.sendMessage(msg.chat.id, 'finish....');
      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [keyboardActions, [newMineAction]],
        },
      });
    });
  });

  bot.onText(/\/mine (.*)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const args = match[1];
      await Cmds.cmdDoMine({ ctx, realm, args, FORMATION });
    });
  });

  bot.onText(/\/support (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const args = match[1];
      await Cmds.cmdDoSupport({ ctx, realm, args, SUPPORT_PORI });
    });
  });

  bot.onText(/\/atk (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const args = match[1];
      await Cmds.cmdDoAtk({
        ctx,
        realm,
        args,
        FORMATION,
        MINE_ATK_PRICE_FACTOR,
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

  bot.onText(/\/auto_play (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const args = match[1];
      if (!ctx.walletAcc)
        return bot.sendMessage(
          msg.chat.id,
          `please call /wallet_unlock <.enveloped_key..> frist`
        );

      if (Number.isNaN(+args)) {
        return bot.sendMessage(
          msg.chat.id,
          `please call /auto_play <numberofHours>`
        );
      }

      autoPlayV1({ ctx, realm, timeOutHours: +args, playerAddress, bot, msg });
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
      const lunaBusd = await queryBinancePrice({ ctx, pair: 'LUNABUSD' });

      bot.sendMessage(
        msg.chat.id,
        `#price
        <pre><code class="language-json">${JSON.stringify(
          {
            ...rigyPoolInfo,
            ...rikenPoolInfo,
            'LUNA->BUSD': lunaBusd.price,
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

      const formatedData = sellingItems.slice(0, 5).map((itm) => {
        const {
          tokenId,
          price,
          helpPower,
          minePower,
          numOfBreeds,
          maxOfBreeds,
        } = itm;
        return {
          tokenId,
          link: `https://marketplace.poriverse.io/pori/${tokenId}`,
          price: (BigInt(price) / TEN_POWER_10_BN).toString() + ' RIGY',
          minePower,
          helpPower,
          breed: `${numOfBreeds} / ${maxOfBreeds}`,
        };
      });

      const resp = `
<b>Top 5:</b>
${formatedData
  .map((itm) => {
    const { link, price, minePower, helpPower, breed, tokenId } = itm;

    const appLink = `https://link.trustwallet.com/open_url?url=${link}&coin_id=966`;
    return `  link: <a href="${appLink}">${tokenId}</a>
      - price: ${price}
      - minePower: ${minePower}
      - helpPower: ${helpPower}
      - breed: ${breed}
    `;
  })
  .join('\n')}
`;

      await bot.sendMessage(msg.chat.id, resp, { parse_mode: 'HTML' });
    });
  });

  // --------------------
  // cmd handler End
  // --------------------

  console.log('🤖 started');

  for (const id of Memory.activeChats) {
    await bot.sendMessage(id, 'hi 👋!');
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

async function boot() {
  console.log(env, activeEnv);

  if (!playerAddress) {
    console.log('missing process.env.PLAYER_ADDRESS');
    process.exit(1);
  }
  console.log('PlayerAddress:', playerAddress);
  console.log('Example: cli');

  const ctx = await init(ENV.Prod);
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
