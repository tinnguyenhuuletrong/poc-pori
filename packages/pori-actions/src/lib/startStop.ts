import {
  Context,
  ENV,
  getContextSetting,
  getIdleGameAddressSC,
  getPortalAddressSC,
  getWeb3NodeUri,
  getWeb3NodeUriHttp,
} from '@pori-and-friends/pori-metadata';
import { EventEmitter } from 'stream';
import Web3 from 'web3';

export async function init(env: ENV): Promise<Context> {
  const uriws = getWeb3NodeUri(env);
  const urihttp = getWeb3NodeUriHttp(env);

  if (!uriws && !urihttp) {
    console.error(`missing env NODE_URI_${env} or NODE_URI_${env}_HTTP`);
    process.exit(1);
  }

  const provider = uriws
    ? new Web3.providers.WebsocketProvider(uriws)
    : new Web3.providers.HttpProvider(urihttp);

  console.log(
    'use web3 provider',
    provider instanceof Web3.providers.WebsocketProvider ? 'wss' : 'http'
  );

  const web3 = new Web3(provider);

  const idleGameSc = getIdleGameAddressSC(env);
  const portalSc = getPortalAddressSC(env);
  if (!portalSc) throw new Error('missing portal sc config');

  const contract = new web3.eth.Contract(idleGameSc.abi, idleGameSc.address);
  const contractPortal = new web3.eth.Contract(portalSc.abi, portalSc.address);

  const { setting, custom } = getContextSetting(env);

  const ctx: Context = {
    contract,
    contractPortal,
    web3,
    provider,
    env,
    emiter: new EventEmitter(),

    ui: {
      writeMessage: async (msg) => console.log(msg),
      editMessage: async (lastMsginfo, msg) => {
        /*nothing*/
      },
    },
    setting: setting,
    custom: custom,
  };

  return ctx;
}

export async function close(ctx: Context) {
  ctx.provider.disconnect();
}
