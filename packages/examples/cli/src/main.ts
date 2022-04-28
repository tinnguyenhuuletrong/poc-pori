import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import { init, close, Input } from '@pori-and-friends/pori-actions';
import { ENV } from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import repl from 'repl';

const env = ENV.Prod;
const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;

async function main() {
  console.log(env, activeEnv);
  console.log('Example: cli');

  const ctx = await init(ENV.Prod);
  console.log('connected');

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
}

main();
