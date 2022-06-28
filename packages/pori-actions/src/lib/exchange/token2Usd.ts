import { Context } from '@pori-and-friends/pori-metadata';
import { queryBinancePrice } from './binance';
import { getKyberPoolRIGYPrice, getKyberPoolRIKENPrice } from './kyberPool';

const CACHE_TIMEOUT_MS = 1 * 60 * 1000; // 1 min
const Cache = {
  rigy2Usd: 0,
  rken2Usd: 0,
  _time: 0,
};

export async function token2Usd(ctx: Context) {
  const now = Date.now();
  if (now - Cache._time < CACHE_TIMEOUT_MS) {
    return {
      rigy2Usd: Cache.rigy2Usd,
      rken2Usd: Cache.rken2Usd,
    };
  }

  const rigyPoolInfo = await getKyberPoolRIGYPrice({ ctx });
  const rikenPoolInfo = await getKyberPoolRIKENPrice({ ctx });
  const [maticBusd] = await Promise.all([
    queryBinancePrice({ ctx, pair: 'MATICBUSD' }),
  ]);

  Cache.rigy2Usd = +rigyPoolInfo['RIGY->MATIC'] * +maticBusd.price;
  Cache.rken2Usd = +rikenPoolInfo['RIKEN->MATIC'] * +maticBusd.price;
  Cache._time = now;

  return {
    rigy2Usd: Cache.rigy2Usd,
    rken2Usd: Cache.rken2Usd,
  };
}
