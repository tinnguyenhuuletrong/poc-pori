import { Context } from '@pori-and-friends/pori-metadata';
import { axiosIns } from '@pori-and-friends/utils';

const formatTokenDecimal = (decimals: number) => (inp: string) =>
  +inp / 10 ** decimals;
const toDecimal = (decimals: number) => (inp: number) =>
  String(+inp * 10 ** decimals);

export const COMMON_POLYGON_TOKEN = {
  MATIC: {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'MATIC',
    name: 'Matic',
    decimals: 18,
    formatDisplay: formatTokenDecimal(18),
    toDecimal: toDecimal(18),
  },
  WMATIC: {
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    symbol: 'WMATIC',
    name: 'Wrapped Matic',
    decimals: 18,
    formatDisplay: formatTokenDecimal(18),
    toDecimal: toDecimal(18),
  },
  USDT: {
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    formatDisplay: formatTokenDecimal(6),
    toDecimal: toDecimal(6),
  },
};

export type KyberSwapRouteParam = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  saveGas: '0' | '1' | string;
  gasInclude?: '1' | '0' | string;
  dexes?: 'quickswap' | string;
  slippageTolerance: number; // 100
  deadline: number; // in sec
  to: string; // recived address
  chargeFeeBy?: '';
  feeReceiver?: '';
  isInBps?: '';
  feeAmount?: '';
  clientData: '{"source":"kyberswap"}';
};

export type KyberRouteInfo = {
  inputAmount: string;
  outputAmount: string;
  totalGas: number;
  gasPriceGwei: string;
  gasUsd: number;
  amountInUsd: number;
  amountOutUsd: number;
  receivedUsd: number;
  encodedSwapData: string;
  routerAddress: string;
  isMeta: boolean;
  requestId: string;
  swaps: any[];
  tokens: Record<string, any>;
};
export async function queryKyberSwapRoute({
  ctx,
  params,
  chainName = 'polygon',
}: {
  ctx: Context;
  chainName: 'polygon';
  params: KyberSwapRouteParam;
}): Promise<KyberRouteInfo> {
  const baseURL = 'https://aggregator-api.kyberswap.com';
  const url = `/${chainName}/route/encode`;

  const res = await axiosIns.request({
    method: 'get',
    baseURL,
    url,
    params: params,
  });
  if (res.status !== 200)
    throw new Error(`Request failed status ${res.status} - ${res.data}`);

  const data = JSON.parse(res.data) as KyberRouteInfo;
  return data;
}

function humarizeKyberExchangeResponse(
  inTokenInfo: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    formatDisplay: (inp: string) => number;
    toDecimal: (inp: number) => string;
  },
  outTokenInfo: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    formatDisplay: (inp: string) => number;
    toDecimal: (inp: number) => string;
  },
  res: KyberRouteInfo,
  ctx: Context
) {
  const route = `${inTokenInfo.symbol} -> ${outTokenInfo.symbol}`;
  const hInputAmount = inTokenInfo.formatDisplay(res.inputAmount);
  const hOutputAmount = outTokenInfo.formatDisplay(res.outputAmount);
  const stepNum = res.swaps?.[0]?.length;
  const gas = ctx.web3.utils.fromWei(res.gasPriceGwei);
  const summary = { route, hInputAmount, hOutputAmount, stepNum, gas };
  return summary;
}

async function routeWithPair(
  ctx: Context,
  inTokenInfo: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    formatDisplay: (inp: string) => number;
    toDecimal: (inp: number) => string;
  },
  outTokenInfo: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    formatDisplay: (inp: string) => number;
    toDecimal: (inp: number) => string;
  },
  amountIn: number
) {
  const MODE_OPTIMIZE_GAS = { gasInclude: '0', dexes: 'quickswap' };
  const MODE_OPTIMIZE_RETURN = { gasInclude: '0' };

  const res = await queryKyberSwapRoute({
    ctx,
    chainName: 'polygon',
    params: {
      tokenIn: inTokenInfo.address,
      tokenOut: outTokenInfo.address,
      amountIn: inTokenInfo.toDecimal(amountIn),
      saveGas: '0',

      ...MODE_OPTIMIZE_RETURN,

      slippageTolerance: 100,
      deadline: Math.floor(Date.now() / 1000 + 7200),
      to: '0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA',
      chargeFeeBy: '',
      feeReceiver: '',
      isInBps: '',
      feeAmount: '',
      clientData: '{"source":"kyberswap"}',
    },
  });

  const summary = humarizeKyberExchangeResponse(
    inTokenInfo,
    outTokenInfo,
    res,
    ctx
  );

  return {
    summary: summary,
    detail: res,
  };
}

// Shortcut

export async function routeExchangeMatic2USDT({
  ctx,
  amountIn = 1,
}: {
  ctx: Context;
  amountIn: number;
}) {
  const inTokenInfo = COMMON_POLYGON_TOKEN.MATIC;
  const outTokenInfo = COMMON_POLYGON_TOKEN.USDT;

  return await routeWithPair(ctx, inTokenInfo, outTokenInfo, amountIn);
}

export async function routeExchangeUSDT2Matic({
  ctx,
  amountIn = 1,
}: {
  ctx: Context;
  amountIn: number;
}) {
  const inTokenInfo = COMMON_POLYGON_TOKEN.USDT;
  const outTokenInfo = COMMON_POLYGON_TOKEN.MATIC;

  return await routeWithPair(ctx, inTokenInfo, outTokenInfo, amountIn);
}
