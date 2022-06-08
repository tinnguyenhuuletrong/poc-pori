import * as MongoDataStore from '@pori-and-friends/mongodb-data-store';
import {
  addWalletConnectToContext,
  Adventure,
  close,
  getKyberPoolRIGYPrice,
  getKyberPoolRIKENPrice,
  getMaticBalance,
  getTokenBalance,
  init,
  Input,
  queryBinancePrice,
  queryMarketInfo,
  Computed,
} from '@pori-and-friends/pori-actions';
import {
  ENV,
  getIdleGameAddressSC,
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
} from '@pori-and-friends/utils';
import type { ITxData } from '@walletconnect/types';
import {
  copyFileSync,
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import repl from 'repl';
import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import * as AppEnvProdPorichain from './environments/environment.prod.porichain';

const env = ENV.Prod;
const activeEnv = computeActiveEnv(env);
const playerAddress = process.env.PLAYER_ADDRESS;
const MINE_ATK_PRICE_FACTOR = 1.2;

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
    console.log(msg);
  };

  await addWalletConnectToContext(
    ctx,
    activeEnv.environment.walletConnectSessionStoragePath
  );

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

  const server = repl.start({
    prompt: '>',
    useColors: true,
    useGlobal: true,
    terminal: true,
  });

  server.setupHistory(process.env.NODE_REPL_HISTORY, () => {
    // noop;
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

  server.defineCommand('storage.upload', {
    help: 'upload realm data to storage',
    action: async () => {
      const stream = createReadStream(activeEnv.environment.dbPath);
      console.log('upload snapshot');

      const dbMetadata = await Repos.IdleGameSCMetadataRepo.findOne(
        realm,
        'default'
      );
      const metadata = {
        revision: dbMetadata.updatedBlock,
      };

      await MongoDataStore.storeBlob(ctx, 'pori-db-realm', stream, metadata);
      console.log(`uploaded - revision:${metadata.revision}`);
    },
  });

  server.defineCommand('storage.download', {
    help: 'upload realm data to storage',
    action: async () => {
      console.log('begin download');
      const [fileMeta, dataStream] = await MongoDataStore.downloadBlob(
        ctx,
        'pori-db-realm'
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
      for (let i = 0; i < 30; i++) {
        const latestBlockInfo = await ctx.web3.eth.getBlock('latest');
        const res = await Adventure.queryMineinfoFromSc(ctx, 49264);
        const offset =
          (Date.now() - res.rewardMap.startTimeInDate.valueOf()) / 1000;
        const nextRewardLevel = await Adventure.queryRandomRewardLevelFromSc(
          ctx,
          res
        );
        console.dir(
          {
            blockNum: latestBlockInfo.number,
            txHash: latestBlockInfo.hash,
            offset,
            nextRewardLevel,
          },
          { depth: 5 }
        );
      }
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
      const web3GasPrice = await currentGasPrice();

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
          link: `https://marketplace.poriverse.io/pori/${tokenId}`,
          price: (BigInt(price) / TEN_POWER_10_BN).toString() + ' RIGY',
          minePower,
          helpPower,
          breed: `${numOfBreeds} / ${maxOfBreeds}`,
        };
      });

      console.log(formatedData);
    },
  });

  server.defineCommand('stats', {
    help: 'Show my adv',
    action: async (addr) => {
      const humanView =
        await Computed.MyAdventure.refreshAdventureStatsForAddress(
          { realm, ctx },
          addr || playerAddress
        );
      delete humanView.targets;
      delete humanView.note;
      console.dir(humanView, { depth: 5 });
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

  server.defineCommand('wallet.balance', {
    help: 'get wallet balance',
    action: async () => {
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

      console.log({
        RIGY,
        RIKEN,
        MATIC,
      });
    },
  });

  server.defineCommand('mine', {
    help: 'send new mine request',
    action: async (args) => {
      if (!ctx.walletConnectChannel?.connected) {
        console.warn(
          'wallet channel not ready. Please run .wallet.start first'
        );
        return;
      }

      const tmp = args.split(' ');
      const usePortal = !!tmp[0];

      const poriants = ['1346', '5420', '1876'];
      const index = Adventure.randAdventureSlot(3);

      const callData = ctx.contract.methods
        .startAdventure(
          // poriants
          poriants,

          // index
          index,

          // notPortal
          !usePortal
        )
        .encodeABI();

      console.log({
        poriants,
        index,
        usePortal,
      });

      const tx = {
        from: ctx.walletConnectChannel.accounts[0],
        to: getIdleGameAddressSC(env).address,
        data: callData, // Required
      };

      // Sign transaction
      await sendRequestForWalletConnectTx(tx);
    },
  });

  server.defineCommand('atk', {
    help: 'send new mine request',
    action: async (args) => {
      if (!ctx.walletConnectChannel?.connected) {
        console.warn(
          'wallet channel not ready. Please run .wallet.start first'
        );
        return;
      }
      const tmp = args.split(' ');
      const mineId = tmp[0];
      const usePortal = !!tmp[1];
      if (!mineId) {
        console.warn('\tUsage: .new.atk <mineId> [usePortal = false]');
        return;
      }

      const addvStats =
        await Computed.MyAdventure.refreshAdventureStatsForAddress(
          { realm, ctx },
          playerAddress
        );

      console.log('STATS');
      console.dir(
        {
          protentialTarget: addvStats.protentialTarget,
          activeMines: addvStats.activeMines,
        },
        { depth: 5 }
      );

      console.log('EXEC');
      console.log({ mineId, usePortal });
      const mineInfo = addvStats.targets[mineId];

      if (!mineInfo) {
        console.log('opps. Mine status changed');
        return;
      }

      const poriants = ['1346', '5420', '1876'];
      const index = Adventure.randAdventureSlot(3, mineInfo.farmerSlots);

      const callData = ctx.contract.methods
        .support1(
          // mineId
          mineId,
          // poriants
          poriants,

          // index
          index,

          // notPortal
          !usePortal
        )
        .encodeABI();

      console.log({
        method: 'support1',
        mineId,
        poriants,
        index,
        usePortal,
        callData,
      });

      const web3GasPrice = await ctx.web3.eth.getGasPrice();
      const factor = MINE_ATK_PRICE_FACTOR;

      const tx: ITxData = {
        from: ctx.walletConnectChannel.accounts[0],
        to: getIdleGameAddressSC(env).address,
        data: callData, // Required
        gasPrice: +web3GasPrice * factor,
      };

      // Sign transaction
      await sendRequestForWalletConnectTx(tx);
    },
  });

  async function currentGasPrice() {
    return await ctx.web3.eth.getGasPrice();
  }

  function sendRequestForWalletConnectTx(tx: ITxData) {
    return ctx.walletConnectChannel
      .sendTransaction(tx)
      .then((result) => {
        console.log(result);
        return ctx.web3.eth.getTransactionReceipt(result);
      })
      .then((txInfo) => {
        console.log(txInfo);
      })
      .catch((error) => {
        // Error returned when rejected
        console.error(error);
      });
  }
}

main();
