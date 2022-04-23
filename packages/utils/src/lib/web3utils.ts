import Web3 from 'web3';
const web3 = new Web3();

export function functionSignature(inp: string) {
  return web3.eth.abi.encodeFunctionSignature(inp);
}
