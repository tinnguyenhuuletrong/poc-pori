import {
  parseDnaToBodyPart,
  queryNftInfo,
} from '@pori-and-friends/pori-actions';
import { ENV } from '@pori-and-friends/pori-metadata';

async function main() {
  // const dnaBody = parseDnaToBodyPart(
  //   '5454541313131354131313131313131313131313131313545454135400000000'
  // );
  // console.log(dnaBody);

  const nftInfoProd = await queryNftInfo(4311, {
    env: ENV.Prod,
  });
  console.log(`prod ${4311} ->`, nftInfoProd);

  // const nftInfoStag = await queryNftInfo(1876, {
  //   env: ENV.Staging,
  // });
  // console.log(`stag ${1876} ->`, nftInfoStag);
}

main();
