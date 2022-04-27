import * as path from 'path';

export const environment = {
  dbPath: path.join(
    __dirname,
    '../../../../archived/repo/prod/allEvents.prod.realm'
  ),
  createdBlock: 27503296,

  production: true,
};
