import crypto from 'crypto';
const algo = 'aes-256-cbc';

export function generateAesKey(pass: string): { key: Buffer; algo: string } {
  const salt = crypto.randomBytes(16);
  const keyLengthBytes = 256 / 8;

  const key = crypto.scryptSync(pass, salt, keyLengthBytes);

  return { key, algo };
}

export function generateAesIv() {
  const iv = crypto.randomBytes(16);
  return iv;
}

export async function encryptAes({
  key,
  iv,
  data,
}: {
  key: Buffer;
  iv: Buffer;
  data: string;
}) {
  return new Promise<string>((resolve, reject) => {
    const cipher = crypto.createCipheriv(algo, key, iv);

    let encrypted = '';
    cipher.on('readable', () => {
      let chunk;
      while (null !== (chunk = cipher.read())) {
        encrypted += chunk.toString('hex');
      }
    });
    cipher.on('end', () => {
      resolve(encrypted);
    });
    cipher.on('error', (err) => {
      reject(err);
    });

    cipher.write(data);
    cipher.end();
  });
}

export async function decryptAes({
  key,
  iv,
  encrypted,
}: {
  key: Buffer;
  iv: Buffer;
  encrypted: string;
}) {
  return new Promise<string>((resolve, reject) => {
    const decipher = crypto.createDecipheriv(algo, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    resolve(decrypted);
  });
}
