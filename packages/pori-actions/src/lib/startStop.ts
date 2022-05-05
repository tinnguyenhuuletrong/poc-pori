import {
  Context,
  ENV,
  getIdleGameAddressSC,
  getWeb3NodeUri,
  getWeb3NodeUriHttp,
} from '@pori-and-friends/pori-metadata';
import Web3 from 'web3';

export async function init(env: ENV): Promise<Context> {
  const uriws = getWeb3NodeUri(env);
  const urihttp = getWeb3NodeUriHttp(env);

  const provider = uriws
    ? new Web3.providers.WebsocketProvider(uriws)
    : new Web3.providers.HttpProvider(urihttp);

  const web3 = new Web3(provider);

  const idleGameSc = getIdleGameAddressSC(env);
  const contract = new web3.eth.Contract(idleGameSc.abi, idleGameSc.address);

  const ctx: Context = {
    contract,
    web3,
    provider,
    env,
  };

  return ctx;
}

export async function close(ctx: Context) {
  ctx.provider.disconnect();
}
