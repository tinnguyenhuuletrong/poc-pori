import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { WebsocketProvider } from "web3-core";

export type Context = {
  contract: Contract;
  web3: Web3;
  provider: WebsocketProvider;
};
