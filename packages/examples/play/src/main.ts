import repl from 'repl';
import Web3 from 'web3';

async function main() {
  const rpcUri = 'https://rpc1.porichain.io';
  const provider = new Web3.providers.HttpProvider(rpcUri);
  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();

  global.web3 = web3;

  const server = repl.start({
    prompt: '>',
    useColors: true,
    useGlobal: true,
    terminal: true,
  });
}
main();
