import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import {
  init,
  close,
  Input,
  addWalletConnectToContext,
} from '@pori-and-friends/pori-actions';
import { ENV, getIdleGameAddressSC } from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import repl from 'repl';

const env = ENV.Prod;
const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;

async function main() {
  console.log(env, activeEnv);
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

  server.defineCommand('wallet.start', {
    help: 'Start walletconnect',
    action: async () => {
      if (ctx.walletConnectChannel?.connected) {
        console.warn('wallet channel already connected');
        return;
      }

      console.warn('trying to reset wallet channel');

      ctx.walletConnectChannel = null;
      await addWalletConnectToContext(
        ctx,
        activeEnv.environment.walletConnectSessionStoragePath
      );
    },
  });

  server.defineCommand('wallet.sign.tx', {
    help: 'sign tx request',
    action: async () => {
      if (!ctx.walletConnectChannel?.connected) {
        console.warn(
          'wallet channel not ready. Please run .wallet.start first'
        );
        return;
      }

      const callData = ctx.contract.methods
        .startAdventure(
          // poriants
          ['1346', '5420', '1876'],
          // index
          ['1', '2', '3'],
          // notPortal
          true
        )
        .encodeABI();

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
}

main();
