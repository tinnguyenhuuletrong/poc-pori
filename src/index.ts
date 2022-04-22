import Web3 from "web3";
import { getIdleGameAddressSC } from "./info";
import { Context, ENV } from "./type";

export async function init(env: ENV): Promise<Context> {
  if (!process.env.NODE_URI) {
    console.error("missing env NODE_URI");
    process.exit(1);
  }

  const provider = new Web3.providers.WebsocketProvider(process.env.NODE_URI);
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

export * from "./lib/basic";
export * from "./lib/nftBodyPart";
export * from "./lib/queryPoriApi";
