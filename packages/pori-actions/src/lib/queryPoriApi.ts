import { Context, getAPILink } from '@pori-and-friends/pori-metadata';
import { ENV, NftInfo } from '@pori-and-friends/pori-metadata';
import { axiosIns } from '@pori-and-friends/utils';
import { queryMissiontOfPoriSc } from './adventure';
import { toChecksumAddress } from './util/web3utils';

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

export type NftInfoForSale = NftInfo & {
  price: string;
  saleId: number;
  engagedMission?: number;
};

export async function queryMarketInfo({
  ctx,
}: {
  ctx: Context;
}): Promise<NftInfoForSale[]> {
  // https://api.poriverse.io/api/v1/assets

  const baseURL = getAPILink(ctx.env);

  const res = await axiosIns.request({
    method: 'get',
    baseURL,
    url: `/api/v1/assets`,
    params: {
      status: '1',
      pageIndex: '0',
      pageSize: '35',
      sortBy: 'price',
      sortOrder: 'asc',
      minPrice: '0',
      maxPrice: '99000000',
      minNumOfBreeds: '0',
      maxNumOfBreeds: '5',
      minLegend: '0',
      maxLegend: '7',
      minMinePower: '0',
      maxMinePower: '500',
      minHelpPower: '0',
      maxHelpPower: '500',
      stage: '',
      type: '',
      poriClass: '',
      keyword: '',
    },
  });
  if (res.status !== 200)
    throw new Error(`Request failed status ${res.status} - ${res.data}`);

  const data = (JSON.parse(res.data)?.items || []) as NftInfoForSale[];
  return data;
}

export async function expandEngadedMission({
  ctx,
  data,
}: {
  ctx: Context;
  data: NftInfoForSale[];
}) {
  return Promise.all(
    data.map(async (itm) => {
      const engagedMission = await queryMissiontOfPoriSc(ctx, itm.tokenId);
      return {
        ...itm,
        engagedMission: engagedMission,
      };
    })
  );
}
