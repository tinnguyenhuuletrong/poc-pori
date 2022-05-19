import { Context } from '@pori-and-friends/pori-metadata';
import { GridFSBucket, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import debug from 'debug';
import { Stream } from 'stream';

const log = debug('pori:mongodb-data-store');

export async function addMongodbDataStore(
  ctx: Context,
  uri: string,
  pathToCert: string
): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    sslKey: pathToCert,
    sslCert: pathToCert,
    serverApi: ServerApiVersion.v1,
  });

  await client.connect();
  ctx.mongoClient = client;

  log('connected!');
  return client;
}

export async function storeBlob(ctx: Context, key: string, dataStream: Stream) {
  if (!ctx.mongoClient) throw new Error('ctx.mongoClient not found');

  const db = ctx.mongoClient.db('storage');
  const bucket = new GridFSBucket(db);

  const writeStream = bucket.openUploadStreamWithId(
    new ObjectId('628644ff444fce03a34933d6'),
    key
  );
  dataStream.pipe(writeStream);

  return new Promise<void>((resolve, _) => {
    writeStream.once('finish', () => {
      resolve();
    });
  });
}
