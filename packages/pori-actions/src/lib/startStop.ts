import {
  Context,
  ENV,
  getIdleGameAddressSC,
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
  const contract = new web3.eth.Contract(idleGameSc.abi, idleGameSc.address);

  // getGas porichain return as 500. But avg fee on chain around 4100
  const gasFactor = env === ENV.ProdPorichain ? 8.2 : 1;
  const safeGweith = env === ENV.ProdPorichain ? 500 : 80;
  const autoPlayMicroDlayMs = env === ENV.ProdPorichain ? 10000 : 3000;

  const ctx: Context = {
    contract,
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
    setting: {
      gasFactor: gasFactor,
      safeGweith,
      autoPlayMicroDelayMs: autoPlayMicroDlayMs,
    },
  };

  return ctx;
}

export async function close(ctx: Context) {
  ctx.provider.disconnect();
}
