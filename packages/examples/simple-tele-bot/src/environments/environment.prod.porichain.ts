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
  botMemoryPath: path.join(
    __dirname,
    '../../../../archived/repo/.botMemRabbit'
  ),
  mongodbDataStoreUri: process.env.MONGODB_DATA_STORE_URI,
  mongodbDataStoreSSLCer: path.join(
    __dirname,
    '../../../../archived/repo/mongodb.pem'
  ),
  aesKeyPath: path.join(__dirname, '../../../../archived/repo/.aesKeyRabbit'),
  createdBlock: 7643,
  production: true,
};
