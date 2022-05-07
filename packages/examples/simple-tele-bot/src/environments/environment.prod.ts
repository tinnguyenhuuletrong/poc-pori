import path from 'path';

export const environment = {
  dbPath: path.join(
    __dirname,
    '../../../../archived/repo/prod/allEvents.prod.realm'
  ),
  walletConnectSessionStoragePath: path.join(
    __dirname,
    '../../../../archived/repo/.web3session'
  ),
  botMemoryPath: path.join(__dirname, '../../../../archived/repo/.botMem'),
  createdBlock: 27503296,
  production: true,
};
