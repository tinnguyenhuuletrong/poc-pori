import Web3 from "web3";
import { ABI_IDLE, gameInfo } from "./info/sta-poriverse_info";
import { Context } from "./type";

export async function init(): Promise<Context> {
  if (!process.env.NODE_URI) {
    console.error("missing env NODE_URI");
    process.exit(1);
  }

  const provider = new Web3.providers.WebsocketProvider(process.env.NODE_URI);
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(
    ABI_IDLE,
    gameInfo.m.app.contractAddress.idleGameAddress
  );

  const ctx: Context = {
    contract,
    web3,
    provider,
  };

  return ctx;
}

export async function close(ctx: Context) {
  ctx.provider.disconnect();
}

export * from "./lib/basic";
