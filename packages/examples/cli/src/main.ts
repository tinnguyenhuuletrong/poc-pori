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
import inquirer from 'inquirer';

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

  const prompt = inquirer.createPromptModule({
    rl: server,
  } as any);

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
      const answer = await prompt([
        {
          type: 'list',
          name: 'confirmExist',
          message: 'Do you want to quit ?',
          choices: ['yes', 'no'],
          default() {
            return 'yes';
          },
        },
      ]);

      console.log(answer);
      server.displayPrompt();
      console.log((prompt as any).activePromptObj);
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

  server.defineCommand('stats.my_adv', {
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

  server.defineCommand('wallet.new.mine', {
    help: 'send new mine request',
    action: async () => {
      if (!ctx.walletConnectChannel?.connected) {
        console.warn(
          'wallet channel not ready. Please run .wallet.start first'
        );
        return;
      }

      const poriants = ['1346', '5420', '1876'];
      const index = Adventure.randAdventureSlot(3);

      const callData = ctx.contract.methods
        .startAdventure(
          // poriants
          poriants,

          // index
          index,

          // notPortal
          true
        )
        .encodeABI();

      console.log({
        poriants: ['1346', '5420', '1876'],
        index: Adventure.randAdventureSlot(3),
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
    return humanView;
  }
}

main();
