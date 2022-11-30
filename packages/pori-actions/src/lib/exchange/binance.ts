import { Context } from '@pori-and-friends/pori-metadata';
import { axiosIns } from '@pori-and-friends/utils';

export type BinancePriceInfo = {
  symbol: string;
  price: string;
};
export async function queryBinancePrice({
  ctx,
  pair,
}: {
  ctx: Context;
  pair: string;
}): Promise<BinancePriceInfo> {
  try {
    const baseURL = 'https://api.binance.com';

    const res = await axiosIns.request({
      method: 'get',
      baseURL,
      url: `/api/v3/ticker/price`,
      params: {
        symbol: pair.toUpperCase(),
      },
    });
    if (res.status !== 200)
      throw new Error(`Request failed status ${res.status} - ${res.data}`);

    const data = JSON.parse(res.data) as BinancePriceInfo;
    return data;
  } catch (error) {
    return {
      symbol: 'err',
      price: '0',
    };
  }
  // https://api.binance.com/api/v3/ticker/price?symbol=LUNAUSDT
}
