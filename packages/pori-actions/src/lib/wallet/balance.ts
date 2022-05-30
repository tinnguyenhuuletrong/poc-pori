import type { Contract } from 'web3-eth-contract';
import { Context } from '@pori-and-friends/pori-metadata';

const minABI: any = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

const contractForTokenCache: Record<string, Contract> = {};

export async function getTokenBalance({
  ctx,
  erc20Address,
  walletAddress,
}: {
  ctx: Context;
  erc20Address: string;
  walletAddress: string;
}) {
  let contract = contractForTokenCache[erc20Address];
  if (!contract) {
    contract = new ctx.web3.eth.Contract(minABI, erc20Address);
    contractForTokenCache[erc20Address] = contract;
  }

  const res = await contract.methods.balanceOf(walletAddress).call();

  return parseInt(res) / 10 ** 18;
}

export async function getMaticBalance({
  ctx,
  walletAddress,
}: {
  ctx: Context;
  walletAddress: string;
}) {
  const balanceInWei = await ctx.web3.eth.getBalance(walletAddress);
  return +ctx.web3.utils.fromWei(balanceInWei);
}
