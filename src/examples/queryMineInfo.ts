import { close, getMineInfo, init } from "..";

async function main() {
  console.log("Example: queryMineInfo");

  const ctx = await init();
  const mineId = 19433;
  const mineInfo = await getMineInfo(ctx, mineId);
  console.log(`mineInfo ${mineId} ->`, mineInfo);

  await close(ctx);
}
main();
