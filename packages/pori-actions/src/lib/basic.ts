import { EventEmitter } from 'stream';
import { Context } from '@pori-and-friends/pori-metadata';
import { BlockNumber } from 'web3-core';

export async function getMineInfo({ contract }: Context, mineId: string) {
  const mineInfo = await contract.methods.mines(mineId).call();
  const { state, farmer, helper, rewardMap } = mineInfo;
  return { state, farmer, helper, rewardMap };
}

export async function listenEvents({
  contract,
}: Context): Promise<EventEmitter> {
  // To scan pass event from blockA -> blockB
  // use
  //  https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#getpastevents

  // Scan all event from currentTime
  return contract.events
    .allEvents()
    .on('connected', function (subscriptionId: string) {
      console.log(subscriptionId);
    });
}

export async function scanEvents(
  ctx: Context,
  {
    filter = 'allEvents',
    fromBlock,
    toBlock,
  }: {
    filter: string;
    fromBlock: BlockNumber;
    toBlock: BlockNumber;
  }
) {
  const contract = ctx.contract;

  return contract.getPastEvents(filter, {
    fromBlock,
    toBlock,
  });
}
