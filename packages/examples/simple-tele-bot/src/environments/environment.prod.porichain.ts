import path from 'path';

export const environment = {
  dbPath: path.join(
    __dirname,
    '../../../../archived/repo/prodPoriChain/allEvents.prod.realm'
  ),
  walletConnectSessionStoragePath: path.join(
    __dirname,
    '../../../../archived/repo/.web3session'
  ),
  botMemoryPath: path.join(__dirname, '../../../../archived/repo/.botMemDante'),
  mongodbDataStoreUri: process.env.MONGODB_DATA_STORE_URI,
  mongodbDataStoreSSLCer: path.join(
    __dirname,
    '../../../../archived/repo/mongodb.pem'
  ),
  aesKeyPath: path.join(__dirname, '../../../../archived/repo/.aesKeyDante'),
  createdBlock: 7643,
  production: true,
};
