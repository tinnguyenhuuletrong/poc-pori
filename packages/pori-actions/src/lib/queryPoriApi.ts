import { getAPILink } from '@pori-and-friends/pori-metadata';
import { ENV, NftInfo } from '@pori-and-friends/pori-metadata';
import { axiosIns } from '@pori-and-friends/utils';
import { toChecksumAddress } from '@pori-and-friends/utils/lib/web3utils';

export async function queryNftInfo(
  id: string | number,
  ctx: {
    env: ENV;
  } = {
    env: ENV.Staging,
  }
): Promise<NftInfo> {
  const baseURL = getAPILink(ctx.env);

  const res = await axiosIns.request({
    method: 'get',
    baseURL,
    url: `/api/v1/assets/${id}`,
  });
  if (res.status !== 200)
    throw new Error(`Request failed status ${res.status} - ${res.data}`);

  const data = JSON.parse(res.data) as NftInfo;
  data.ownerAddress = toChecksumAddress(data.ownerAddress);
  return data;
}
