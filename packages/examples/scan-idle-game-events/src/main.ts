import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import {
  close,
  scanEvents,
  init,
  transformIdleGameEvent2Database,
  queryNftInfo,
} from '@pori-and-friends/pori-actions';
import { Context, ENV, IdleGameSc } from '@pori-and-friends/pori-metadata';
import {
  openRepo,
  IdleGameSCMetadataRepo,
  IdleGameSCEventRepo,
  IdleGameSCEventDataModel,
  PoriRepo,
  PlayerRepo,
} from '@pori-and-friends/pori-repositories';
import { waitForMs } from '@pori-and-friends/utils';
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

  await updateEventDb(realm, ctx);
  // cli(realm, ctx);
}
main();

function cli(realm: Realm, ctx: Context) {
  const debugCtx = {
    realm,
    ctx,
    IdleGameSCMetadataRepo,
    IdleGameSCEventRepo,
    PoriRepo,
    PlayerRepo,
  };
  global.debugCtx = debugCtx;
  console.log('ready to play global.debugCtx');
}

async function updateEventDb(realm: Realm, ctx: Context) {
  try {
    const scData = await IdleGameSCMetadataRepo.getOrCreateWithTx(
      realm,
      'default',
      {
        updatedBlock: activeEnv.environment.createdBlock,
        createdBlock: activeEnv.environment.createdBlock,
      }
    );

    let from = scData.updatedBlock;

    const batchSize = 500;
    const headBlock = await ctx.web3.eth.getBlockNumber();
    console.log('top block', headBlock);
    console.log('data', scData.toJSON());

    while (from < headBlock) {
      const to = Math.min(from + batchSize, headBlock);
      console.log('scan from ', { from, to: from + batchSize });
      const events = await scanEvents(ctx, {
        filter: 'allEvents',
        fromBlock: from,
        toBlock: to,
      });

      from = to;

      await IdleGameSCMetadataRepo.tx(realm, () => {
        scData.updatedBlock = to;

        const transformedEvents = events
          .map((itm) => IdleGameSc.parseIdleGameScEvent(itm))
          .filter(Boolean);

        for (const iterator of transformedEvents) {
          IdleGameSCEventRepo.create(
            realm,
            IdleGameSCEventDataModel.generate(iterator)
          );
        }
      });
    }

    await updateKnowleageDb(realm, ctx);

    console.log('bye!');
  } catch (error) {
    console.error(error);
  } finally {
    await close(ctx);
    realm.close();
  }
}

async function updateKnowleageDb(realm: Realm, ctx: Context) {
  const metadata = await IdleGameSCMetadataRepo.findOne(realm, 'default');

  const knCursor = metadata.extras['knCursor'] || '000000000000000000000000';

  const events = await IdleGameSCEventRepo.findAll(realm);

  const scanner = events.filtered(`_id >= oid(${knCursor})`);
  console.log(`updateKnowleageDb need to update ${scanner.length} events`);

  const total = scanner.length;

  const resolveNft = async (id) => {
    const data = await queryNftInfo(id, ctx);
    return data;
  };

  let count = 0;
  const saveInterval = 10;

  const onIt = (id) => {
    count++;
    if (count % saveInterval === 0) {
      IdleGameSCMetadataRepo.tx(realm, () => {
        metadata.extras['knCursor'] = id.toHexString();
      });
    }
    console.log('onit', id, count / total);
  };

  await transformIdleGameEvent2Database(
    realm,
    Array.from(scanner.values()) as any,
    resolveNft,
    onIt
  );

  onIt(scanner[scanner.length - 1]._id);
  console.log('updateKnowleageDb done');
}
