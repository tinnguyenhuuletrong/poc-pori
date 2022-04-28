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
  createdBlock: 27503296,
  production: true,
};
