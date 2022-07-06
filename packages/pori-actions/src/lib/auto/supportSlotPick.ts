import { Adventure } from '../../index';
import { AdventureInfoEx, Context } from '@pori-and-friends/pori-metadata';
import { uniq } from 'lodash';
import { ESB_P_THRESHOLD_KEEP_BIG_REWARD } from './autoPlayWorkflow';

/*
  No supporter
    random new slot
  If has bigReward
    farmer found:
      calculate esb. If >= 15%
        send support to bigReward slot (protect it)
      else
        open new slot
    assit found: ignore -> open new slot
  else
    open new slot
*/
export async function supportSlotPick({
  mineInfo,
  isFarmer,
  pori,
  ctx,
}: {
  mineInfo: AdventureInfoEx;
  isFarmer: boolean;
  pori: string;
  ctx: Context;
}): Promise<number> {
  const supporterRewardLevel = mineInfo?.supporterRewardLevel || [];
  const farmerRewardLevel = mineInfo?.farmerRewardLevel || [];
  const hasSupporter = !!mineInfo.supporterAddress;
  const activeIndexs = [
    ...(mineInfo?.farmerSlots || []),
    ...(mineInfo?.supporterSlots || []),
  ];
  const activeRewardLevels = [...farmerRewardLevel, ...supporterRewardLevel];

  let slotIndex!: number;
  const bigRewardIndex = activeIndexs[activeRewardLevels.indexOf(4)];
  const isFarmerFound = farmerRewardLevel.includes(4);
  let esbPercentage = NaN;
  let bigRewardEP = -1,
    bigRewardAP = -1;

  if (!hasSupporter)
    slotIndex = Adventure.randAdventureSlot(1, uniq(activeIndexs))[0];
  else if (hasSupporter && mineInfo.hasBigReward) {
    if (isFarmerFound) {
      // calculate ESB
      //  https://docs.poriverse.io/game-guide/chapter-1-the-lost-porian/esb-explorer-strike-back
      const farmerPories = mineInfo?.farmerPories || [];
      const supporterPories = mineInfo?.supporterPories || [];
      const farmerPori = farmerPories[farmerRewardLevel.indexOf(4)];
      bigRewardEP = mineInfo?.powers[farmerPori] ?? 0;
      const supporterPori = supporterPories[supporterRewardLevel.indexOf(4)];
      bigRewardAP = mineInfo?.powers[supporterPori] ?? 0;
      const esbCal = await ctx.contract.methods
        .getESB(bigRewardEP, bigRewardAP)
        .call();
      esbPercentage = Math.round(+esbCal / 100);
      // calculate ESB - end
      if (esbPercentage >= ESB_P_THRESHOLD_KEEP_BIG_REWARD) {
        slotIndex = bigRewardIndex;
      } else slotIndex = Adventure.randAdventureSlot(1, uniq(activeIndexs))[0];
    } else slotIndex = Adventure.randAdventureSlot(1, uniq(activeIndexs))[0];
  } else {
    slotIndex = Adventure.randAdventureSlot(1, uniq(activeIndexs))[0];
  }

  console.log({
    isFarmer,
    activeIndexs,
    activeRewardLevels,
    bigRewardIndex,
    pori,
    slotIndex,
    isFarmerFound,
  });
  await ctx.ui.writeMessage(
    `roger that!. send pori ${pori} to support mineId:${mineInfo.mineId} at ${slotIndex} 

    - (bigRewardIndex: ${bigRewardIndex}, isFarmerFound:${isFarmerFound}) 
    - (bigRewardEP1: ${bigRewardEP}, bigRewardAP1: ${bigRewardAP}, esbPercentage: ${esbPercentage})`
  );
  return slotIndex;
}
