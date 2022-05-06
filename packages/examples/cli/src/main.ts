import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import {
  init,
  close,
  Input,
  DataView,
  Adventure,
  addWalletConnectToContext,
} from '@pori-and-friends/pori-actions';
import {
  AdventureInfo,
  ENV,
  getIdleGameAddressSC,
} from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import repl from 'repl';

const env = ENV.Prod;
const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;
const playerAddress = process.env.PLAYER_ADDRESS;
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

  const realm = await Repos.openRepo({
    path: activeEnv.environment.dbPath,
  });

  global.realm = realm;
  global.ctx = ctx;
  global.Repos = Repos;

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

  server.defineCommand('test', {
    help: 'test',
    action: async () => {
      const answer = server.question('are you sure ? -> ', () => {
        console.log('answer');
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

  server.defineCommand('stats', {
    help: 'Show my adv',
    action: async (addr) => {
      const humanView = await refreshAdventureStatsForAddress(addr);

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

  server.defineCommand('new.mine', {
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
      ctx.walletConnectChannel
        .sendTransaction(tx)
        .then((result) => {
          // Returns signed transaction
          console.log(result);
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error);
        });
    },
  });

  server.defineCommand('new.atk', {
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

      const tx = {
        from: ctx.walletConnectChannel.accounts[0],
        to: getIdleGameAddressSC(env).address,
        data: callData, // Required
      };

      // Sign transaction
      ctx.walletConnectChannel
        .sendTransaction(tx)
        .then((result) => {
          // Returns signed transaction
          console.log(result);
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error);
        });
    },
  });

  async function refreshAdventureStatsForAddress(addr: string) {
    console.log('refreshAdventureStatsForAddress begin');

    await Input.updateEventDb(realm, ctx, {
      createdBlock: activeEnv.environment.createdBlock,
    });

    const activeAddr = addr || playerAddress;

    const viewData = await DataView.computePlayerAdventure({
      realm,
      playerAddress: activeAddr,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });
    console.log('refreshAdventureStatsForAddress end');

    // humanView
    const humanView = {
      note: DataView.humanrizeNote(viewData),

      // my active adventures
      mines: {},

      // protential target
      targets: {},
      protentialTarget: [],
      activeMines: 0,
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
        const sinceSec =
          (Date.now() - new Date(val.startTime).valueOf()) / 1000;
        return {
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

    return humanView;
  }
}

main();
