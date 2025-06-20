import path from 'path';
process.env.NODE_REPL_HISTORY = path.join(
  __dirname,
  '../../../../archived/repo/.history'
);
export const environment = {
  dbPath: path.join(
    __dirname,
    '../../../../archived/repo/prod/allEvents.prod.realm'
  ),
  walletConnectSessionStoragePath: path.join(
    __dirname,
    '../../../../archived/repo/.web3session'
  ),
  mongodbDataStoreUri: process.env.MONGODB_DATA_STORE_URI,
  mongodbDataStoreSSLCer: path.join(
    __dirname,
    '../../../../archived/repo/mongodb.pem'
  ),
  aesKeyPath: path.join(__dirname, '../../../../archived/repo/.aesKey'),
  createdBlock: 27503296,
  production: true,
};
