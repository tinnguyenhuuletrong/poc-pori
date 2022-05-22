import path from 'path';

export const environment = {
  dbPath: path.join(
    __dirname,
    '../../../../archived/repo/stag/allEvents.stag.realm'
  ),
  aesKeyPath: '',
  mongodbDataStoreUri: '',
  mongodbDataStoreSSLCer: '',
  walletConnectSessionStoragePath: '',
  createdBlock: 25777543,
  production: false,
};
