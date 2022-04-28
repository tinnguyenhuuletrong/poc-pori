import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import { close, init, Input } from '@pori-and-friends/pori-actions';
import { ENV } from '@pori-and-friends/pori-metadata';
import { openRepo } from '@pori-and-friends/pori-repositories';
const env = ENV.Prod;
const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;

async function main() {
  console.log(env, activeEnv);
  console.log('Example: scanEvents');
  const path = activeEnv.environment.dbPath;

  const ctx = await init(ENV.Prod);
  console.log('connected');

  const realm = await openRepo({
    path,
  });

  await Input.updateEventDb(realm, ctx, {
    createdBlock: activeEnv.environment.createdBlock,
  });

  await close(ctx);
  realm.close();
}
main();
