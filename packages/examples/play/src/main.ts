import { ENV, getIdleGameAddressSC } from '@pori-and-friends/pori-metadata';
import repl from 'repl';
import Web3 from 'web3';

async function main() {
  const rpcUri = 'https://rpc1.porichain.io';
  const provider = new Web3.providers.HttpProvider(rpcUri);
  const web3 = new Web3(provider);
  const env = ENV.ProdPorichain;

  const chainId = await web3.eth.getChainId();
  const idleGameSc = getIdleGameAddressSC(env);
  const contract = new web3.eth.Contract(idleGameSc.abi, idleGameSc.address);

  console.log(contract.events['AdventureSupported2']);

  global.web3 = web3;

  // const server = repl.start({
  //   prompt: '>',
  //   useColors: true,
  //   useGlobal: true,
  //   terminal: true,
  // });

  // 0xc84a -> 51274
  // const res = await contract.getPastEvents('allEvents', {
  //   fromBlock: 696060,
  //   toBlock: 696069,
  // });
  // console.dir(res, { depth: 6 });

  // const res = await web3.eth.getPastLogs({
  //   fromBlock: 684112,
  //   address: idleGameSc.address,
  // });
  // console.dir(res, { depth: 6 });
}
main();
