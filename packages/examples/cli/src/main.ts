import * as MongoDataStore from '@pori-and-friends/mongodb-data-store';
import {
  addWalletConnectToContext,
  Auto,
  close,
  Computed,
  expandEngadedMission,
  getKyberPoolRIGYPrice,
  getKyberPoolRIKENPrice,
  getMaticBalance,
  getTokenBalance,
  init,
  Input,
  queryBinancePrice,
  queryMarketInfo,
  token2Usd,
  WalletActions,
} from '@pori-and-friends/pori-actions';
import {
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
import {
  decryptAes,
  encryptAes,
  generateAesIv,
  generateAesKey,
  waitForMs,
} from '@pori-and-friends/utils';
import {
  copyFileSync,
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import os from 'os';
import repl, { REPLServer } from 'repl';
import {
  RuntimeConfig,
  loggerInfo,
  noHistoryMode,
  playerAddress,
} from './app/config';
import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import * as AppEnvProdPorichain from './environments/environment.prod.porichain';

let env = ENV.ProdPorichain;
let activeEnv = computeActiveEnv(env);
let autoRunCommand = '';
let server!: REPLServer;

function computeActiveEnv(env: ENV) {
  let activeEnv: typeof AppEnv;
  switch (env) {
    case ENV.Prod:
      activeEnv = AppEnvProd;
      break;
    case ENV.ProdPorichain:
      activeEnv = AppEnvProdPorichain;
      break;
    case ENV.Staging:
      activeEnv = AppEnv;
      break;
  }
  return activeEnv;
}

async function main() {
  for (let i = 0; i < process.argv.length; i++) {
    const element = process.argv[i];
    if (element === '--env') env = ENV[process.argv[i + 1]] as ENV;
    else if (element === '--cmd') autoRunCommand = process.argv[i + 1];
  }

  activeEnv = computeActiveEnv(env);
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
  ctx.ui.writeMessage = async (msg) => {
    loggerInfo(msg);
  };

  if (activeEnv.environment.mongodbDataStoreUri) {
    MongoDataStore.addMongodbDataStore(
      ctx,
      activeEnv.environment.mongodbDataStoreUri,
      activeEnv.environment.mongodbDataStoreSSLCer
    );
  }

  let realm = await Repos.openRepo({
    path: activeEnv.environment.dbPath,
  });

  async function reloadRealm() {
    realm = await Repos.openRepo({
      path: activeEnv.environment.dbPath,
    });
    global.realm = realm;
  }

  const scheduler = new Repos.Services.SchedulerService();
  await scheduler.start(realm);

  global.realm = realm;
  global.ctx = ctx;
  global.Repos = Repos;
  global.Services = {
    scheduler,
  };
  global.test = getMobileWalletApplink;

  server = repl.start({
    prompt: '>',
    useColors: true,
    useGlobal: true,
    terminal: true,
  });

  if (!noHistoryMode)
    server.setupHistory(process.env.NODE_REPL_HISTORY, () => {
      loggerInfo(`history stored at ${process.env.NODE_REPL_HISTORY}`);
    });

  //-----------------------------------------//
  // Cli Cmds
  //-----------------------------------------//

  server.defineCommand('exit', {
    help: 'Gracefull exit',
    action: async () => {
      console.log('shutting down....');
      await close(ctx);
      realm.close();
      console.log('bye!');
      process.exit(0);
    },
  });

  server.defineCommand('ci.uploadSnapshot', {
    help: 'ci script. updatedb + update snapshot',
    action: async () => {
      await doStats(realm, ctx);
      await doUploadSnapshot(realm, ctx);

      process.exit(0);
    },
  });

  server.defineCommand('storage.upload', {
    help: 'upload realm data to storage',
    action: async () => {
      await doUploadSnapshot(realm, ctx);
    },
  });

  server.defineCommand('storage.download', {
    help: 'upload realm data to storage',
    action: async () => {
      const backupKey = getDatastoreBackupKey(env);

      console.log(`begin download - ${backupKey}`);
      const [fileMeta, dataStream] = await MongoDataStore.downloadBlob(
        ctx,
        backupKey
      );

      const totalBytes = fileMeta.length;
      let downloaded = 0;
      console.log(`metadata: revision:${fileMeta.metadata?.revision}`);
      console.log('totalBytes', totalBytes);
      dataStream.prependListener('data', (chunk) => {
        downloaded += chunk.length;
        console.log('progress', downloaded / totalBytes);
      });

      dataStream
        .pipe(createWriteStream('./tmp/snapshot.realm'))
        .on('finish', async () => {
          console.log('finish');
          console.log('begin extract');

          realm.close();
          copyFileSync('./tmp/snapshot.realm', activeEnv.environment.dbPath);

          console.log('extract success');
          await reloadRealm();

          console.log('reload realm success');
        });
    },
  });

  server.defineCommand('schedule.list', {
    help: 'List pending schedule',
    action: async () => {
      const jobs = await scheduler.listPendingJob(realm);
      console.log(
        jobs.map(({ _id, codeName, params, runAt }) => ({
          _id,
          runAt,
          codeName,
          params,
        }))
      );
    },
  });

  server.defineCommand('schedule.create', {
    help: 'create schedule',
    action: async (args) => {
      const tmp = args.split(' ');
      const jobId = tmp[0];
      const codeName = tmp[1];
      const afterMs = parseInt(tmp[2]);
      const data = tmp[3] ?? '';
      if (!codeName || Number.isNaN(afterMs)) {
        console.warn(
          '\tUsage: schedule.create <id> <codeName> <afterMs> [data]'
        );
        return;
      }
      await scheduler.scheduleJob(realm, {
        _id: jobId,
        codeName,
        params: data,
        runAt: new Date(Date.now() + afterMs),
      });

      const jobs = await scheduler.listPendingJob(realm);
      console.log(
        jobs.map(({ _id, codeName, params }) => ({ _id, codeName, params }))
      );
    },
  });

  server.defineCommand('schedule.delete', {
    help: 'delete schedule',
    action: async (args) => {
      const id = args;
      await scheduler.deleteJob(realm, id);
      const jobs = await scheduler.listPendingJob(realm);
      console.log(
        jobs.map(({ _id, codeName, params }) => ({ _id, codeName, params }))
      );
    },
  });

  server.defineCommand('genKey', {
    help: 'gen new aes Keypair',
    action: async () => {
      const { key, algo } = generateAesKey('123');
      const iv = generateAesIv();
      console.log(key.toString('hex'), iv.toString('hex'));
      writeFileSync(
        activeEnv.environment.aesKeyPath,
        JSON.stringify({
          key: key.toString('hex'),
          iv: iv.toString('hex'),
          algo,
          genAt: new Date(),
        })
      );
    },
  });

  server.defineCommand('encData', {
    help: 'enc data',
    action: async (arg) => {
      if (!existsSync(activeEnv.environment.aesKeyPath)) {
        console.error('key not found. need to run .genKey firse');
        return;
      }
      const keyObj = JSON.parse(
        readFileSync(activeEnv.environment.aesKeyPath).toString()
      );

      const key = Buffer.from(keyObj.key, 'hex');
      const iv = Buffer.from(keyObj.iv, 'hex');
      console.log(`${arg} -> ${await encryptAes({ key, iv, data: arg })}`);
    },
  });

  server.defineCommand('decData', {
    help: 'dec data',
    action: async (arg) => {
      if (!existsSync(activeEnv.environment.aesKeyPath)) {
        console.error('key not found. need to run .genKey firse');
        return;
      }
      const keyObj = JSON.parse(
        readFileSync(activeEnv.environment.aesKeyPath).toString()
      );

      const key = Buffer.from(keyObj.key, 'hex');
      const iv = Buffer.from(keyObj.iv, 'hex');
      console.log(`${arg} -> ${await decryptAes({ key, iv, encrypted: arg })}`);
    },
  });

  server.defineCommand('test', {
    help: 'test',
    action: async () => {
      const price = await token2Usd(ctx);
      console.log(price);
    },
  });

  server.defineCommand('auto.list', {
    help: 'auto list',
    action: async () => {
      console.log(Auto.AutoPlayDb);
    },
  });

  server.defineCommand('auto.background_refresh', {
    help: 'auto background_refresh',
    action: async () => {
      await Auto.autoRefreshStatus({
        ctx,
        realm,
        playerAddress,
        args: { type: 'background_refresh', intervalMs: 2 * 60 * 1000 },
      });
    },
  });

  server.defineCommand('auto.all', {
    help: 'auto all',
    action: async () => {
      if (!ctx.walletAcc)
        return ctx.ui.writeMessage(
          `please call .wallet.unlock <.enveloped_key..> frist`
        );

      // update bot formations here
      for await (const iterator of RuntimeConfig.formations) {
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

        await waitForMs(20000);
      }

      // background update db
      await Auto.autoRefreshStatus({
        ctx,
        realm,
        playerAddress,
        args: { type: 'background_refresh', intervalMs: 2 * 60 * 1000 },
      });
    },
  });

  server.defineCommand('bot.pull', {
    help: 'Bot Update KnowleageDB',
    action: async () => {
      console.log('updateKnowleage begin');
      await Input.updateEventDb(realm, ctx, {
        createdBlock: activeEnv.environment.createdBlock,
      });
      console.log('updateKnowleage end');
    },
  });

  server.defineCommand('gas', {
    help: 'calculate gasPrice',
    action: async () => {
      const web3GasPrice = await WalletActions.currentGasPrice({ ctx });
      console.log(ctx.web3.utils.fromWei(web3GasPrice, 'gwei'), 'gwei');
    },
  });

  server.defineCommand('price', {
    help: 'Kyberswap token price',
    action: async () => {
      const rigyPoolInfo = await getKyberPoolRIGYPrice({ ctx });
      const rikenPoolInfo = await getKyberPoolRIKENPrice({ ctx });
      const [lunaBusd, maticBusd] = await Promise.all([
        queryBinancePrice({ ctx, pair: 'LUNABUSD' }),
        queryBinancePrice({ ctx, pair: 'MATICBUSD' }),
      ]);
      console.log({
        ...rigyPoolInfo,
        ...rikenPoolInfo,
        'LUNA->BUSD': lunaBusd.price,
        'MATIC->BUSD': maticBusd.price,
      });
    },
  });

  server.defineCommand('market', {
    help: 'marketplace',
    action: async () => {
      const sellingItems = await queryMarketInfo({ ctx });
      const shortList = await expandEngadedMission({
        ctx,
        data: sellingItems.slice(0, 10),
      });
      const marketplaceBaseUrl = getMarketplayBaseLink(ctx.env);

      const formatedData = shortList.map((itm) => {
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
          link: `${marketplaceBaseUrl}/pori/${tokenId}`,
          price: (BigInt(price) / TEN_POWER_10_BN).toString() + ' RIGY',
          minePower,
          helpPower,
          engagedMission,
          breed: `${numOfBreeds} / ${maxOfBreeds}`,
        };
      });

      console.log(formatedData);
    },
  });

  server.defineCommand('stats', {
    help: 'Show my adv',
    action: async (addr) => {
      doStats(realm, ctx, addr);
    },
  });

  server.defineCommand('wallet.reset', {
    help: 'Start walletconnect',
    action: async () => {
      console.warn('trying to reset wallet channel');

      ctx.walletConnectChannel = null;
      await addWalletConnectToContext(
        ctx,
        activeEnv.environment.walletConnectSessionStoragePath
      );
    },
  });

  server.defineCommand('wallet.unlock', {
    help: 'Start walletconnect',
    action: async (args) => {
      if (!existsSync(activeEnv.environment.aesKeyPath)) {
        await ctx.ui.writeMessage(
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
        const encrypted = args;
        privKey = await decryptAes({ key, iv, encrypted });
      } catch (error) {
        await ctx.ui.writeMessage('decrypt error...');
        return;
      }

      try {
        const acc = ctx.web3.eth.accounts.privateKeyToAccount(privKey);
        if (acc.address !== playerAddress)
          throw new Error('not match playerAddress...');

        ctx.walletAcc = acc;
      } catch (error) {
        await ctx.ui.writeMessage(error.message);
        return;
      }

      await ctx.ui.writeMessage('wallet unlocked..');
    },
  });

  server.defineCommand('wallet.balance', {
    help: 'get wallet balance',
    action: async () => {
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

      if (ctx.env === ENV.ProdPorichain) RIGY = MATIC;

      console.log({
        RIGY,
        RIKEN,
        MATIC,
        RigyUsd: RIGY * priceInfo.rigy2Usd,
        RikenUsd: RIKEN * priceInfo.rken2Usd,
      });
    },
  });

  server.defineCommand('whoami', {
    help: 'whoami',
    action: async () => {
      const localMetadata = await getLocalRealmRevision(realm);

      const resp = `i am 🤖. 
  uptime: ${process.uptime()}
  pid: ${process.pid}
  hostname: ${os.hostname()}
  playerAddress: ${playerAddress}
  walletUnlock: ${Boolean(ctx.walletAcc)}
  settingGasFactor: ${ctx.setting.gasFactor} 
  realmRevision: ${localMetadata.revision}
  env: ${env}
    `;
      console.log(resp);
    },
  });

  //----------------------------------------------------//
  // Auto run ci support
  //----------------------------------------------------//
  if (autoRunCommand) {
    console.info('[cmd mode] Run cmd', autoRunCommand);
    server.write(`.${autoRunCommand}\n`);
  }
}

main();

async function getLocalRealmRevision(realm: Realm) {
  const dbMetadata = await Repos.IdleGameSCMetadataRepo.findOne(
    realm,
    'default'
  );
  const localMetadata = {
    revision: dbMetadata.updatedBlock,
  };
  return localMetadata;
}

async function doStats(realm: Realm, ctx: Context, addr?: string) {
  const humanView = await Computed.MyAdventure.refreshAdventureStatsForAddress(
    {
      realm,
      ctx,
      options: { withGasPrice: true, withPortal: true, withPrice: true },
    },
    addr || playerAddress
  );
  delete humanView.targets;
  delete humanView.note;
  humanView.protentialTarget = humanView.protentialTarget
    .slice(0, 5)
    .filter((itm) => !!itm);
  console.dir(humanView, { depth: 5 });

  const graphInfo = await Computed.MyAdventure.genLast7DaysGraphData({
    ctx,
    realm,
    playerAddress: addr || playerAddress,
  });
  console.log(graphInfo);
}

async function doUploadSnapshot(realm: Realm, ctx: Context) {
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
}
