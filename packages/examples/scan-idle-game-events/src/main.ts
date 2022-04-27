import * as AppEnv from './environments/environment';
import { close, scanEvents, init } from '@pori-and-friends/pori-actions';
import { Context, ENV, IdleGameSc } from '@pori-and-friends/pori-metadata';
import {
  openRepo,
  IdleGameSCMetadataRepo,
  IdleGameSCEventRepo,
  IdleGameSCEventDataModel,
} from '@pori-and-friends/pori-repositories';

async function main() {
  console.log('Example: scanEvents');
  const path = AppEnv.environment.dbPath;

  const ctx = await init(ENV.Staging);
  console.log('connected');

  const realm = await openRepo({
    path,
  });

  await updateDb(realm, ctx);
  cli(realm, ctx);
}
main();

function cli(realm: Realm, ctx: Context) {
  const debugCtx = {
    realm,
    ctx,
    IdleGameSCMetadataRepo,
    IdleGameSCEventRepo,
  };
  global.debugCtx = debugCtx;
  console.log('ready to play global.debugCtx');

  //type='PorianDeposited' && data.from="0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA"
}

async function updateDb(realm: Realm, ctx: Context) {
  try {
    const scData = await IdleGameSCMetadataRepo.getOrCreate(realm, 'default', {
      updatedBlock: AppEnv.environment.createdBlock,
      createdBlock: AppEnv.environment.createdBlock,
    });

    let from = scData.updatedBlock;

    const batchSize = 500;
    const headBlock = await ctx.web3.eth.getBlockNumber();
    console.log('top block', headBlock);
    console.log('data', scData.toJSON());

    while (from < headBlock) {
      const to = from + batchSize;
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

    console.log('bye!');
  } catch (error) {
    console.error(error);
  } finally {
    await close(ctx);
    realm.close();
  }
}
