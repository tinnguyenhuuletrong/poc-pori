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
import { Deferred } from '@pori-and-friends/utils';

const log = debug('pori:mongodb-data-store');
const connectDefer = new Deferred();

export async function waitForConnected(ctx: Context) {
  // if (!ctx.mongoClient) throw new Error('ctx.mongoClient not found');

  await connectDefer.promise;
  return ctx.mongoClient;
}

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

  connectDefer.reset();

  await client.connect();
  ctx.mongoClient = client;

  connectDefer.resolve(client);

  log('connected!');
  return client;
}

function getBucket(mongoClient: MongoClient) {
  const db = mongoClient.db('storage');
  const bucket = new GridFSBucket(db, {
    chunkSizeBytes: 10 * 1024 * 1024, // 5mb
  });
  return bucket;
}

export async function storeBlob(
  ctx: Context,
  key: string,
  dataStream: Stream,
  metadata: Record<string, any> = {}
) {
  if (!ctx.mongoClient) throw new Error('ctx.mongoClient not found');

  const bucket = getBucket(ctx.mongoClient);

  // TODO: check max revision to keep
  const oldFiles = await bucket.find({ filename: key }).toArray();
  for (const it of oldFiles) {
    await bucket.delete(it._id);
  }

  const writeStream = bucket.openUploadStream(key, {
    metadata,
  });
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

  const bucket = getBucket(ctx.mongoClient);

  const fileMeta = (
    await bucket.find({ filename: key }, { sort: { uploadDate: -1 } }).toArray()
  )[0];

  const readStream = bucket.openDownloadStreamByName(key);
  return [fileMeta, readStream];
}

export async function fetchBolb(
  ctx: Context,
  key: string
): Promise<GridFSFile> {
  if (!ctx.mongoClient) throw new Error('ctx.mongoClient not found');

  const bucket = getBucket(ctx.mongoClient);

  const fileMeta = (
    await bucket.find({ filename: key }, { sort: { uploadDate: -1 } }).toArray()
  )[0];

  return fileMeta;
}
