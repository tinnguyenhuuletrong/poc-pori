import Web3 from "web3";
const web3 = new Web3();

const methodId = web3.eth.abi.encodeFunctionSignature("upgradeTo(address)");
console.log(methodId);
