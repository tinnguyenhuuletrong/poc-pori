import { close, getMineInfo, init } from '@pori-and-friends/pori-actions';
import { ENV } from '@pori-and-friends/pori-metadata';

async function main() {
  console.log('Example: queryMineInfo');

  const ctx = await init(ENV.Prod);
  const mineId = '1901';
  const mineInfo = await getMineInfo(ctx, mineId);
  console.log(`mineInfo ${mineId} ->`, mineInfo);

  // console.dir(ctx.contract, { depth: 100 });

  await close(ctx);
}
main();
