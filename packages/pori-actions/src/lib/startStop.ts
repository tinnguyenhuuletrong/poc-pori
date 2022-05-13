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

  const ctx: Context = {
    contract,
    web3,
    provider,
    env,
    emiter: new EventEmitter(),
  };

  return ctx;
}

export async function close(ctx: Context) {
  ctx.provider.disconnect();
}
