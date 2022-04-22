import { ENV } from "../type";
import * as stagConfig from "./sta-poriverse_info";
import * as prodConfig from "./prod-poriverse_info";

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
