import path from 'path';

export const environment = {
  dbPath: path.join(
    __dirname,
    '../../../../archived/repo/stag/allEvents.stag.realm'
  ),
  walletConnectSessionStoragePath: '',
  botMemoryPath: path.join(__dirname, '../../../../archived/repo/.botMem'),
  mongodbDataStoreUri: process.env.MONGODB_DATA_STORE_URI,
  mongodbDataStoreSSLCer: '',
  aesKeyPath: '',
  createdBlock: 25777543,
  production: false,
};
