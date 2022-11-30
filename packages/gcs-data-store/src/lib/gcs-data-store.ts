import { Storage } from '@google-cloud/storage';
import { Context } from '@pori-and-friends/pori-metadata';
import { Stream } from 'stream';

const BUCKET_NAME = 'pori-backup';

export async function addGCSDataStore(ctx: Context) {
  const storage = new Storage();
  ctx.gcsStorage = storage;
}

export async function storeBlob(
  ctx: Context,
  key: string,
  dataStream: Stream,
  metadata: Record<string, any> = {}
) {
  if (!ctx.gcsStorage) {
    throw new Error('missing ctx.gcsStorage');
  }
  const storage = ctx.gcsStorage;
  const bucket = storage.bucket(BUCKET_NAME);
  const uploader = new Promise((resolve, reject) => {
    dataStream
      .pipe(
        bucket.file(key).createWriteStream({
          metadata: {
            metadata,
          },
        })
      )
      .on('finish', () => {
        resolve(null);
      })
      .on('error', reject);
  });
  await uploader;
}

export async function storeFile(
  ctx: Context,
  key: string,
  filePath: string,
  metadata: Record<string, any> = {}
) {
  if (!ctx.gcsStorage) {
    throw new Error('missing ctx.gcsStorage');
  }
  const storage = ctx.gcsStorage;
  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.upload(filePath, {
    destination: key,
    metadata: {
      metadata,
    },
    onUploadProgress: console.log,
  });
}

export async function deleteBlob(ctx: Context, key: string) {
  if (!ctx.gcsStorage) {
    throw new Error('missing ctx.gcsStorage');
  }
  const storage = ctx.gcsStorage;
  const bucket = storage.bucket(BUCKET_NAME);

  await bucket.file(key).delete({ ignoreNotFound: true });
}

export async function downloadBlob(ctx: Context, key: string) {
  if (!ctx.gcsStorage) {
    throw new Error('missing ctx.gcsStorage');
  }
  const storage = ctx.gcsStorage;
  const bucket = storage.bucket(BUCKET_NAME);

  return bucket.file(key).createReadStream();
}

export type GCSFileMetadata = {
  name: string;
  bucket: string;
  size: string;
  timeCreated: string;
  metadata: Record<string, any>;
};

export async function fetchBlobMetadata(ctx: Context, key: string) {
  if (!ctx.gcsStorage) {
    throw new Error('missing ctx.gcsStorage');
  }
  const storage = ctx.gcsStorage;
  const bucket = storage.bucket(BUCKET_NAME);
  const [metaData, _] = await bucket.file(key).getMetadata();
  return metaData as GCSFileMetadata;
}
