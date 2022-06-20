import {
  Token,
  WETH,
  Fetcher,
  Trade,
  Route,
  TokenAmount,
  TradeType,
} from '@dynamic-amm/sdk';
import {
  Context,
  getKyberSwapFactoryAddress,
  getRIGYTokenInfoOnPolygon,
  getRIKENTokenInfoOnPolygon,
  getWeb3NodeUriPolygonHttp,
} from '@pori-and-friends/pori-metadata';

let lazyProvider: any;
async function getProvider({ ctx }: { ctx: Context }) {
  if (lazyProvider) return lazyProvider;

  const etherJs = await import('@ethersproject/providers');
  const url = getWeb3NodeUriPolygonHttp();
  lazyProvider = new etherJs.JsonRpcProvider(url);
  return lazyProvider;
}

export async function getKyberPoolRIGYPrice({
  ctx,
  amountInWei = '1000000000000000000',
}: {
  ctx: Context;
  amountInWei?: string;
}) {
  const tokenInfo = getRIGYTokenInfoOnPolygon();
  const KyberFactoryAddress = getKyberSwapFactoryAddress(ctx.env);
  const provider = await getProvider({ ctx });

  const RIGYToken = new Token(
    +tokenInfo.chainId,
    tokenInfo.tokenAddress,
    +tokenInfo.decimal,
    tokenInfo.symbol
  );

  const pools = await Fetcher.fetchPairData(
    RIGYToken,
    WETH[RIGYToken.chainId],
    KyberFactoryAddress,
    provider
  );

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
  const KyberFactoryAddress = getKyberSwapFactoryAddress(ctx.env);

  const RIGYToken = new Token(
    +tokenInfo.chainId,
    tokenInfo.tokenAddress,
    +tokenInfo.decimal,
    tokenInfo.symbol
  );

  const pools = await Fetcher.fetchPairData(
    RIGYToken,
    WETH[RIGYToken.chainId],
    KyberFactoryAddress,
    lazyProvider
  );

  const route = new Route(pools, WETH[RIGYToken.chainId]);

  const trade = new Trade(
    route,
    new TokenAmount(WETH[RIGYToken.chainId], amountInWei),
    TradeType.EXACT_INPUT
  );

  return {
    'RIKEN->MATIC': trade.executionPrice.invert().toSignificant(6),
    'MATIC->RIKEN': trade.executionPrice.toSignificant(6),
  };
}
