import {
  Token,
  WETH,
  Fetcher,
  Trade,
  Route,
  TokenAmount,
  TradeType,
  Pair,
} from '@dynamic-amm/sdk';
import {
  Context,
  getKyberSwapFactoryAddress,
  getRIGYTokenInfoOnPolygon,
  getRIKENTokenInfoOnPolygon,
  getWeb3NodeUriPolygonHttp,
} from '@pori-and-friends/pori-metadata';

let lazyProvider: any;
const PairCacheDb: Record<string, Pair[]> = {};

async function getProvider({ ctx }: { ctx: Context }) {
  if (lazyProvider) return lazyProvider;

  const etherJs = await import('@ethersproject/providers');
  const url = getWeb3NodeUriPolygonHttp();
  lazyProvider = new etherJs.JsonRpcProvider(url);
  return lazyProvider;
}

async function getPairData(ctx: Context, tokenA: Token, tokenB: Token) {
  const KyberFactoryAddress = getKyberSwapFactoryAddress(ctx.env);
  const provider = await getProvider({ ctx });

  const key = `${tokenA.address}_${tokenB.address}`;
  if (PairCacheDb[key]) return PairCacheDb[key];

  PairCacheDb[key] = await Fetcher.fetchPairData(
    tokenA,
    tokenB,
    KyberFactoryAddress,
    provider
  );
  return PairCacheDb[key];
}

export async function getKyberPoolRIGYPrice({
  ctx,
  amountInWei = '1000000000000000000',
}: {
  ctx: Context;
  amountInWei?: string;
}) {
  const tokenInfo = getRIGYTokenInfoOnPolygon();

  const RIGYToken = new Token(
    +tokenInfo.chainId,
    tokenInfo.tokenAddress,
    +tokenInfo.decimal,
    tokenInfo.symbol
  );

  const pools = await getPairData(ctx, RIGYToken, WETH[RIGYToken.chainId]);

  const route = new Route(pools, WETH[RIGYToken.chainId]);

  const trade = new Trade(
    route,
    new TokenAmount(WETH[RIGYToken.chainId], amountInWei),
    TradeType.EXACT_INPUT
  );

  return {
    'RIGY->MATIC': trade.executionPrice.invert().toSignificant(6),
    'MATIC->RIGY': trade.executionPrice.toSignificant(6),
  };
}

export async function getKyberPoolRIKENPrice({
  ctx,
  amountInWei = '1000000000000000000',
}: {
  ctx: Context;
  amountInWei?: string;
}) {
  const tokenInfo = getRIKENTokenInfoOnPolygon();

  const RIKENToken = new Token(
    +tokenInfo.chainId,
    tokenInfo.tokenAddress,
    +tokenInfo.decimal,
    tokenInfo.symbol
  );

  const pools = await getPairData(ctx, RIKENToken, WETH[RIKENToken.chainId]);

  const route = new Route(pools, WETH[RIKENToken.chainId]);

  const trade = new Trade(
    route,
    new TokenAmount(WETH[RIKENToken.chainId], amountInWei),
    TradeType.EXACT_INPUT
  );

  return {
    'RIKEN->MATIC': trade.executionPrice.invert().toSignificant(6),
    'MATIC->RIKEN': trade.executionPrice.toSignificant(6),
  };
}
