import { ENV } from './commonTypes';
import * as stagConfig from './lib/sta-poriverse_info';
import * as prodConfig from './lib/prod-poriverse_info';

export const TEN_POWER_10_BN = BigInt(10 ** 18);

export function getWeb3NodeUri(env: ENV) {
  const key = `NODE_URI_${env}`.toUpperCase();
  return process.env[key] as string;
}

export function getWeb3NodeUriHttp(env: ENV) {
  const key = `NODE_URI_${env}_HTTP`.toUpperCase();
  return process.env[key] as string;
}

export function getAPILink(env: ENV) {
  if (env === ENV.Staging) return stagConfig.gameInfo.m.app.apiUrl;
  else return prodConfig.gameInfo.m.app.apiUrl;
}

export function getKyberSwapFactoryAddress(env: ENV) {
  // https://docs.kyberswap.com/developer-guides/kyberswap-addresses#mainnet

  if (env === ENV.Staging) return '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453';
  return '0x5f1fe642060b5b9658c15721ea22e982643c095c';
}

export function getRIGYTokenInfo(env: ENV) {
  let tokenConfig = prodConfig.gameInfo.m.app;
  if (env === ENV.Staging) {
    tokenConfig = stagConfig.gameInfo.m.app;
  }

  return {
    symbol: tokenConfig.token.inGameSymbol,
    tokenAddress: tokenConfig.token.inGameAddress,
    decimal: tokenConfig.token.inGameDecimal,
    chainId: tokenConfig.rpcMetamask.chainId,
  };
}

export function getRIKENTokenInfo(env: ENV) {
  let tokenConfig = prodConfig.gameInfo.m.app;
  if (env === ENV.Staging) {
    tokenConfig = stagConfig.gameInfo.m.app;
  }

  return {
    symbol: tokenConfig.token.nativeSymbol,
    tokenAddress: tokenConfig.token.nativeAddress,
    decimal: tokenConfig.token.nativeDecimal,
    chainId: tokenConfig.rpcMetamask.chainId,
  };
}

export function getIdleGameAddressSC(env: ENV) {
  if (env === ENV.Staging) {
    return {
      abi: stagConfig.ABI_IDLE,
      address: stagConfig.gameInfo.m.app.contractAddress.idleGameAddress,
    };
  }
  return {
    abi: prodConfig.ABI_IDLE,
    address: prodConfig.gameInfo.m.app.contractAddress.idleGameAddress,
  };
}

export * from './commonTypes';

export * as IdleGameSc from './lib/idleGameSc';
export * from './lib/idleGameSc/type.idleGame';
