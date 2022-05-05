import { Context, IdleGameSc } from '@pori-and-friends/pori-metadata';
import {
  IdleGameSCMetadataRepo,
  IdleGameSCEventRepo,
  IdleGameSCEventDataModel,
} from '@pori-and-friends/pori-repositories';
import { scanEvents } from '../basic';
import { queryNftInfo } from '../queryPoriApi';
import { transformIdleGameEvent2Database } from '../transformer/transformIdleGameEvent2Database';

export async function updateEventDb(
  realm: Realm,
  ctx: Context,
  { createdBlock }: { createdBlock: number }
) {
  try {
    const scData = await IdleGameSCMetadataRepo.getOrCreateWithTx(
      realm,
      'default',
      {
        updatedBlock: createdBlock,
        createdBlock: createdBlock,
      }
    );

    let from = scData.updatedBlock;

    const batchSize = 500;
    const headBlock = await ctx.web3.eth.getBlockNumber();
    console.log('top block', headBlock);
    console.log('context', scData.toJSON());

    while (from < headBlock) {
      const to = Math.min(from + batchSize, headBlock);
      console.log('scan from ', { from, to });
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
          .filter(Boolean) as IdleGameSc.IdleGameSCEvent[];

        for (const iterator of transformedEvents) {
          IdleGameSCEventRepo.create(
            realm,
            IdleGameSCEventDataModel.generate(iterator)
          );
        }
      });
    }

    await updateKnowleageDb(realm, ctx);
  } catch (error) {
    console.error(error);
  } finally {
    // noop
  }
}

async function updateKnowleageDb(realm: Realm, ctx: Context) {
  const metadata = await IdleGameSCMetadataRepo.findOne(realm, 'default');
  if (!metadata) return;

  const knCursor = metadata.extras['knCursor'] || '000000000000000000000000';

  const events = await IdleGameSCEventRepo.findAll(realm);

  const scanner = events.filtered(`_id >= oid(${knCursor})`);
  console.log(`updateKnowleageDb need to update ${scanner.length} events`);

  const total = scanner.length;

  const resolveNft = async (id: string | number) => {
    const data = await queryNftInfo(id, ctx);
    return data;
  };

  let count = 0;
  const saveInterval = 10;

  const onIt = (id: Realm.BSON.ObjectId) => {
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
