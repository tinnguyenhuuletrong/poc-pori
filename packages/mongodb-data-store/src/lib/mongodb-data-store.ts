import { Context } from '@pori-and-friends/pori-metadata';
import {
  GridFSBucket,
  GridFSBucketReadStream,
  GridFSFile,
  MongoClient,
  ObjectId,
  ServerApiVersion,
} from 'mongodb';
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

  // TODO: check max revision to keep
  const oldFiles = await bucket.find({ filename: key }).toArray();
  for (const it of oldFiles) {
    await bucket.delete(it._id);
  }

  const writeStream = bucket.openUploadStream(key);
  dataStream.pipe(writeStream);

  return new Promise<void>((resolve, _) => {
    writeStream.once('finish', () => {
      resolve();
    });
  });
}

export async function downloadBlob(
  ctx: Context,
  key: string
): Promise<[GridFSFile, GridFSBucketReadStream]> {
  if (!ctx.mongoClient) throw new Error('ctx.mongoClient not found');

  const db = ctx.mongoClient.db('storage');
  const bucket = new GridFSBucket(db);

  const fileMeta = (
    await bucket.find({ filename: key }, { sort: { uploadDate: -1 } }).toArray()
  )[0];

  const readStream = bucket.openDownloadStreamByName(key);
  return [fileMeta, readStream];
}
