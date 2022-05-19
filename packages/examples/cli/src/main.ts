import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import {
  init,
  close,
  Input,
  DataView,
  Adventure,
  addWalletConnectToContext,
  getKyberPoolRIGYPrice,
  getKyberPoolRIKENPrice,
  queryMarketInfo,
  queryBinancePrice,
} from '@pori-and-friends/pori-actions';
import {
  AdventureInfo,
  AdventureInfoEx,
  ENV,
  getIdleGameAddressSC,
  TEN_POWER_10_BN,
} from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import repl from 'repl';
import type { ITxData } from '@walletconnect/types';
import { AddressInfo } from 'net';
import { max, maxBy, minBy } from 'lodash';
import moment from 'moment';
import type { TransactionConfig } from 'web3-core';
import * as MongoDataStore from '@pori-and-friends/mongodb-data-store';
import { readFile } from 'fs/promises';
import { createReadStream, readFileSync } from 'fs';

const env = ENV.Prod;
const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;
const playerAddress = process.env.PLAYER_ADDRESS;
const MINE_ATK_PRICE_FACTOR = 1.2;

async function main() {
  console.log(env, activeEnv);

  if (!playerAddress) {
    console.log('missing process.env.PLAYER_ADDRESS');
    process.exit(1);
  }
  console.log('PlayerAddress:', playerAddress);
  console.log('Example: cli');

  const ctx = await init(ENV.Prod);
  console.log('connected');

  await addWalletConnectToContext(
    ctx,
    activeEnv.environment.walletConnectSessionStoragePath
  );

  MongoDataStore.addMongodbDataStore(
    ctx,
    activeEnv.environment.mongodbDataStoreUri,
    activeEnv.environment.mongodbDataStoreSSLCer
  );

  const realm = await Repos.openRepo({
    path: activeEnv.environment.dbPath,
  });

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
      await MongoDataStore.storeBlob(ctx, 'pori-db-realm', stream);
      console.log('uploaded');
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

  server.defineCommand('test', {
    help: 'test',
    action: async () => {
      const usePortal = false;
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

      const tx: TransactionConfig = {
        from: ctx.walletConnectChannel.accounts[0],
        to: getIdleGameAddressSC(env).address,
        data: callData, // Required
        gas: '600000',
        nonce: 174,
      };
      const acc = ctx.web3.eth.accounts.privateKeyToAccount('<Key here>');

      const res = await acc.signTransaction(tx);
      // const res = await ctx.walletConnectChannel.signTransaction(tx);
      console.log(res);

      const txReceipt = ctx.web3.eth.sendSignedTransaction(res.rawTransaction);
      txReceipt.on('receipt', console.log);
      console.log(await txReceipt);
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
      const lunaBusd = await queryBinancePrice({ ctx, pair: 'LUNABUSD' });
      console.log({
        ...rigyPoolInfo,
        ...rikenPoolInfo,
        'LUNA->BUSD': lunaBusd.price,
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

  queryMarketInfo;

  server.defineCommand('stats', {
    help: 'Show my adv',
    action: async (addr) => {
      const humanView = await refreshAdventureStatsForAddress(addr);
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

      const addvStats = await refreshAdventureStatsForAddress(playerAddress);

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

  async function refreshAdventureStatsForAddress(addr: string) {
    await Input.updateEventDb(realm, ctx, {
      createdBlock: activeEnv.environment.createdBlock,
    });

    const activeAddr = addr || playerAddress;
    const now = Date.now();

    const viewData = await DataView.computePlayerAdventure({
      realm,
      playerAddress: activeAddr,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });

    // humanView
    const humanView = {
      note: DataView.humanrizeNote(viewData),

      // my active adventures
      mines: {} as Record<string, AdventureInfoEx>,

      // protential target
      targets: {},
      protentialTarget: [],
      activeMines: 0,
      canDoNextAction: false,
      nextActionAt: '',
      nextActionAtDate: new Date(),
      nextAtkAt: '',
      nextAtkAtDate: new Date(),
      gasPriceGWEI: '',
    };

    for (const k of Object.keys(viewData.activeAdventures)) {
      const value = viewData.activeAdventures[k] as AdventureInfo;
      if (
        value.farmerAddress === activeAddr ||
        value.supporterAddress === activeAddr
      )
        humanView.mines[k] = DataView.humanrizeAdventureInfo(value);
      else if (value.state === 'AdventureStarted') {
        humanView.targets[k] = DataView.humanrizeAdventureInfo(value);
      }
    }

    humanView.protentialTarget = Object.keys(humanView.targets)
      .map((key) => {
        const val = humanView.targets[key];
        const sinceSec = (now - new Date(val.startTime).valueOf()) / 1000;
        return {
          link: val.link,
          mineId: val.mineId,
          hasBigReward: val.hasBigReward,
          startTimeLocalTime: new Date(val.startTime).toLocaleString(),
          startTime: new Date(val.startTime),
          sinceSec,
        };
      })
      .sort((a, b) => {
        return a.hasBigReward - b.hasBigReward;
      });

    humanView.activeMines = Object.keys(humanView.mines).length;

    // mine completed by farmer. But our poriant still lock
    if (humanView.note.readyToStart === false) humanView.activeMines++;

    const web3GasPrice = await currentGasPrice();
    humanView.gasPriceGWEI = ctx.web3.utils.fromWei(web3GasPrice, 'gwei');

    // next action timeline
    const timeViewMine = Object.values(humanView.mines);
    const noBlock = timeViewMine.every((itm) => {
      return !!itm.canCollect;
    });
    const nextActionAt = maxBy(timeViewMine, (v) =>
      v.blockedTo.valueOf()
    )?.blockedTo;

    const nextAtkAt = minBy(
      timeViewMine.filter((itm) => itm.atkAt.valueOf() > now),
      (v) => v.atkAt.valueOf()
    )?.atkAt;

    humanView.canDoNextAction = humanView.note.readyToStart && noBlock;
    if (nextActionAt) {
      humanView.nextActionAt = `${nextActionAt.toLocaleString()} - ${moment(
        nextActionAt
      ).fromNow()}`;
    }
    humanView.nextActionAtDate = nextActionAt;

    if (nextAtkAt) {
      humanView.nextAtkAt = `${nextAtkAt.toLocaleString()} - ${moment(
        nextAtkAt
      ).fromNow()}`;
    }
    humanView.nextAtkAtDate = nextAtkAt;

    return humanView;
  }
}

main();
