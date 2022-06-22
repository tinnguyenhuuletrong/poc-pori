import { Context, CustomEstGasprice, ENV } from './commonTypes';
import * as stagConfig from './lib/sta-poriverse_info';
import * as prodConfig from './lib/prod-poriverse_info';
import * as prodPoriChainConfig from './lib/prod-porichain-poriverse_info';
import { mean } from 'lodash';

export const TEN_POWER_10_BN = BigInt(10 ** 18);
export const TURN_DURATION_SEC = 1800;

export function getWeb3NodeUri(env: ENV) {
  const key = `NODE_URI_${env}`.toUpperCase();
  return process.env[key] as string;
}

export function getWeb3NodeUriHttp(env: ENV) {
  const key = `NODE_URI_${env}_HTTP`.toUpperCase();
  return process.env[key] as string;
}

export function getWeb3NodeUriPolygonHttp() {
  const key = `NODE_URI_${ENV.Prod}_HTTP`.toUpperCase();
  return process.env[key] as string;
}

export function getAPILink(env: ENV) {
  if (env === ENV.Staging) return stagConfig.gameInfo.m.app.apiUrl;
  else if (env === ENV.ProdPorichain)
    return prodPoriChainConfig.gameInfo.m.app.apiUrl;
  else return prodConfig.gameInfo.m.app.apiUrl;
}

export function getKyberSwapFactoryAddress(env: ENV) {
  // https://docs.kyberswap.com/developer-guides/kyberswap-addresses#mainnet

  if (env === ENV.Staging) return '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453';
  return '0x5f1fe642060b5b9658c15721ea22e982643c095c';
}

export function getRIGYTokenInfoOnPolygon() {
  const tokenConfig = prodConfig.gameInfo.m.app;
  return {
    symbol: tokenConfig.token.inGameSymbol,
    tokenAddress: tokenConfig.token.inGameAddress,
    decimal: tokenConfig.token.inGameDecimal,
    chainId: tokenConfig.rpcMetamask.chainId,
  };
}

export function getRIGYTokenInfo(env: ENV) {
  let tokenConfig = prodConfig.gameInfo.m.app;
  if (env === ENV.Staging) {
    tokenConfig = stagConfig.gameInfo.m.app;
  } else if (env === ENV.ProdPorichain)
    tokenConfig = prodPoriChainConfig.gameInfo.m.app;

  return {
    symbol: tokenConfig.token.inGameSymbol,
    tokenAddress: tokenConfig.token.inGameAddress,
    decimal: tokenConfig.token.inGameDecimal,
    chainId: tokenConfig.rpcMetamask.chainId,
  };
}

export function getRIKENTokenInfoOnPolygon() {
  const tokenConfig = prodConfig.gameInfo.m.app;
  return {
    symbol: tokenConfig.token.nativeSymbol,
    tokenAddress: tokenConfig.token.nativeAddress,
    decimal: tokenConfig.token.nativeDecimal,
    chainId: tokenConfig.rpcMetamask.chainId,
  };
}

export function getRIKENTokenInfo(env: ENV) {
  let tokenConfig = prodConfig.gameInfo.m.app;
  if (env === ENV.Staging) {
    tokenConfig = stagConfig.gameInfo.m.app;
  } else if (env === ENV.ProdPorichain)
    tokenConfig = prodPoriChainConfig.gameInfo.m.app;

  return {
    symbol: tokenConfig.token.nativeSymbol,
    tokenAddress: tokenConfig.token.nativeAddress,
    decimal: tokenConfig.token.nativeDecimal,
    chainId: tokenConfig.rpcMetamask.chainId,
  };
}

export function getAdventureBaseLink(env: ENV) {
  if (env === ENV.Staging) return stagConfig.gameInfo.m.app.urlAdventure;
  else if (env === ENV.ProdPorichain)
    return prodPoriChainConfig.gameInfo.m.app.urlAdventure;
  return prodConfig.gameInfo.m.app.urlAdventure;
}

export function getMarketplayBaseLink(env: ENV) {
  if (env === ENV.Staging) return stagConfig.gameInfo.m.app.urlMarketplace;
  else if (env === ENV.ProdPorichain)
    return prodPoriChainConfig.gameInfo.m.app.urlMarketplace;
  return prodConfig.gameInfo.m.app.urlMarketplace;
}

export function getIdleGameAddressSC(env: ENV) {
  if (env === ENV.Staging) {
    return {
      abi: stagConfig.ABI_IDLE,
      address: stagConfig.gameInfo.m.app.contractAddress.idleGameAddress,
      createdBlock: stagConfig.gameInfo.m.app.scCreatedBlock.idle,
    };
  } else if (env === ENV.ProdPorichain)
    return {
      abi: prodPoriChainConfig.ABI_IDLE,
      address:
        prodPoriChainConfig.gameInfo.m.app.contractAddress.idleGameAddress,
      createdBlock: prodPoriChainConfig.gameInfo.m.app.scCreatedBlock.idle,
    };
  return {
    abi: prodConfig.ABI_IDLE,
    address: prodConfig.gameInfo.m.app.contractAddress.idleGameAddress,
    createdBlock: prodConfig.gameInfo.m.app.scCreatedBlock.idle,
  };
}

export function calculateMineTurnTime(startTime: Date) {
  const farmerAtkStartAt = new Date(
    startTime.valueOf() + TURN_DURATION_SEC * 1000
  );
  const supporterAtkStartAt = new Date(
    startTime.valueOf() + TURN_DURATION_SEC * 2 * 1000
  );
  return {
    farmerAtkStartAt,
    supporterAtkStartAt,
  };
}

export function getContextSetting(env: ENV) {
  // getGas porichain return as 500. But avg fee on chain around 4100
  const gasFactor = 1;
  const safeGweith = env === ENV.ProdPorichain ? 5000 : 80;
  const autoPlayMicroDelayMs = env === ENV.ProdPorichain ? 10000 : 3000;

  // custom estimage gas function base on pending tx for porichain
  let estimageGas: CustomEstGasprice | undefined;
  if (env === ENV.ProdPorichain) {
    estimageGas = async (ctx: Context) => {
      const pendingTx = await ctx.web3.eth.getPendingTransactions();
      const avgGas = mean(
        pendingTx
          .filter((itm) => +itm.gasPrice > 0)
          .map((itm) => {
            return +itm.gasPrice;
          })
      );
      return avgGas.toString();
    };
  }

  return {
    setting: { gasFactor, safeGweith, autoPlayMicroDelayMs },
    custom: {
      estimageGas,
    },
  };
}

export * from './commonTypes';

export * as IdleGameSc from './lib/idleGameSc';
export * from './lib/idleGameSc/type.idleGame';
