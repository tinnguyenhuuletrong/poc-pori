import { close, getMineInfo, init } from '@pori-and-friends/pori-actions';
import { ENV } from '@pori-and-friends/pori-metadata';

async function main() {
  console.log('Example: queryMineInfo');

  const ctx = await init(ENV.Staging);
  const mineId = '19433';
  const mineInfo = await getMineInfo(ctx, mineId);
  console.log(`mineInfo ${mineId} ->`, mineInfo);

  await close(ctx);
}
main();
