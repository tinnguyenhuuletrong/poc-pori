import { ENV } from './commonTypes';
import * as stagConfig from './lib/sta-poriverse_info';
import * as prodConfig from './lib/prod-poriverse_info';

export function getWeb3NodeUri(env: ENV) {
  const key = `NODE_URI_${env}`.toUpperCase();
  if (!process.env[key]) {
    console.error(`missing env ${key}`);
    process.exit(1);
  }
  return process.env[key] as string;
}

export function getAPILink(env: ENV) {
  if (env === ENV.Staging) return stagConfig.gameInfo.m.app.apiUrl;
  else return prodConfig.gameInfo.m.app.apiUrl;
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
