import { Adventure } from '../../index';
import { AdventureInfoEx, Context } from '@pori-and-friends/pori-metadata';
import { isEmpty, minBy, sortBy, sum, toString, uniq } from 'lodash';
import { ESB_P_THRESHOLD_KEEP_BIG_REWARD } from './autoPlayWorkflow';
import { minIndex, minIndexBy } from '@pori-and-friends/utils';
import { SCSCellInfo } from '../adventure';

/*
  SBattle
  1. assit 3 pories
    2MaxFarmerPower > 2MaxSupportPower => null

    // supporter have only 1 pori
    //  farmer may have 
    //    1 atk lower => need send more 
    //    0 => need send more
    
    no S => pick 1 pori rewardlevel min
    has S => pick 1 pori. atk > x AND rewardLevel min
  else 
  2. query 
      Adventure.getPoriansAtSCellSc -> {sFarmer, sHelper}
      2MaxFarmerPower, 2MaxSupportPower
  3. if esb(Sum(2MaxFarmerPower) , Sum(2MaxSupportPower)) < 15 => null

  [optional] - optimize cost
  3.5 find optimize pair in case 2MaxFarmerPower > 2MaxSupportPower
        example: 57525
        need to find (max1,max2) 
            - sum(max1,max2) > 2MaxSupportPower
            - min(rewardLevel(max1) + rewardLevel(max2))

  4. Return
     srcIds = [max1, max2].filter(id => !sFarmer.includes(id))
     desIds = sFarmer.filter(id => ![max1, max2].include(id))
     if empty(desIds)
        desIds.fill(srcIds.length,0)
     

swap tables
[3,4] [3]   => src [4] des[0]
[3,4] [4]   => src [3] des[0]
[3,4] [3,5] => src [4] des[5]
[3,4] []    => src [3,4] des [0,0]
[3,4] [5,6] => src [3,4] des [5,6]


3.5 note 
SumMaxEnemyPower
minCost = int.Max

for i 0 -> n-1
  for j i+i -> n
    i.p + j.p > SumMaxEnemyPower
      AND i.rewardLevel + j.rewardLevel < minCost
        
*/

type ParseMineInfo = ReturnType<typeof _parseMineInfo>;
export type SBattlerDecision = {
  missionId: number;
  srcIds: number[];
  desIds: number[];
  sTreasureIndex: number;
};
export async function sbattleSlotPick({
  mineInfo,
  sCellInfo,
  isFarmer,
  ctx,
}: {
  mineInfo: AdventureInfoEx;
  sCellInfo: SCSCellInfo;
  isFarmer: boolean;
  ctx: Context;
}): Promise<SBattlerDecision | null> {
  if (!mineInfo.supporterAddress) {
    await ctx.ui.writeMessage(`sbattle ${mineInfo.mineId}: empty supporter`);
    return null;
  }
  const parseMineInfo = _parseMineInfo(mineInfo);
  const {
    supporterPories,
    hasS,
    mineId,
    sIndex,
    farmerMaxPowerOf2,
    supporterMaxPowerOf2,
    farmerPories,
    supporterPoriesSortedByDecPower,
    farmerPoriesSortedByDecPower,
    powerOf,
  } = parseMineInfo;
  if (!hasS) {
    await ctx.ui.writeMessage(`sbattle ${mineId}: s not found`);
    return null;
  }
  if (supporterPories.length <= 3) {
    await ctx.ui.writeMessage(`sbattle ${mineId}: assit have 3 pories case`);
    return sbattleSlotPickCase3({ mineInfo, sCellInfo, isFarmer, ctx });
  }

  if (supporterMaxPowerOf2 > farmerMaxPowerOf2) {
    const esbCal = await ctx.contract.methods
      .getESB(farmerMaxPowerOf2, supporterMaxPowerOf2)
      .call();
    const esbPercentage = Math.round(+esbCal / 100);
    if (esbPercentage < ESB_P_THRESHOLD_KEEP_BIG_REWARD) {
      await ctx.ui.writeMessage(
        `sbattle ${mineId}: max2Power lesser than supporter ${farmerMaxPowerOf2} < ${supporterMaxPowerOf2}. And ebs too low ${esbPercentage}`
      );
      return null;
    }

    await ctx.ui.writeMessage(`sbattle ${mineId}: ebs ${esbPercentage}`);
  }

  await ctx.ui.writeMessage(
    `sbattle ${mineId}: max2Power of supporter ${supporterMaxPowerOf2}, farmer ${farmerMaxPowerOf2}. sFarmer: ${sCellInfo.farmer.join(
      ','
    )}, sSupport: ${sCellInfo.helper.join(',')}`
  );

  // TODO: optimize
  //    need consier missing case
  //      pori at s already. need find another one => maybe cost lower than global min
  // let { maxSum, minCost, max1, max2 } = _pickSMinimizeLoss(
  //   farmerPoriesSortedByDecPower,
  //   supporterMaxPowerOf2
  // );

  const max1 = farmerPoriesSortedByDecPower[0],
    max2 = farmerPoriesSortedByDecPower[1];
  const maxSum = max1.power + max2.power;
  const minCost = max1.rewardLevel + max2.rewardLevel;

  await ctx.ui.writeMessage(
    `sbattle ${mineId}: max2Power power ${maxSum} cost ${minCost} pair ${max1.id} - ${max1.power} - ${max1.rewardLevel}, ${max2.id} - ${max2.power} - ${max2.rewardLevel}`
  );

  const sFarmer = sCellInfo.farmer.map((itm) => +itm);
  const srcIds = [max1, max2]
    .filter((itm) => !sFarmer.includes(itm.id))
    .map((itm) => itm.id);
  const desIds = sFarmer.filter((itm) => ![max1.id, max2.id].includes(itm));

  // fill 0 for remaining
  if (desIds.length != srcIds.length) {
    const needToFill = srcIds.length - desIds.length;
    for (let i = 0; i < needToFill; i++) {
      desIds.push(0);
    }
  }

  await ctx.ui.writeMessage(
    `sbattle ${mineId}: move srcIds: ${srcIds.join(
      ','
    )} -> desIds: ${desIds.join(',')} `
  );

  return {
    missionId: mineId,
    srcIds,
    desIds,
    sTreasureIndex: sIndex,
  };
}

async function sbattleSlotPickCase3({
  mineInfo,
  sCellInfo,
  isFarmer,
  ctx,
}: {
  mineInfo: AdventureInfoEx;
  sCellInfo: SCSCellInfo;
  isFarmer: boolean;
  ctx: Context;
}): Promise<SBattlerDecision | null> {
  const parseMineInfo = _parseMineInfo(mineInfo);
  const { mineId, sIndex, powerOf } = parseMineInfo;
  const sPowerFarmer = sum(sCellInfo.farmer.map((itm) => powerOf(itm)));
  const sPowerSupporter = sum(sCellInfo.helper.map((itm) => powerOf(itm)));

  // no need to play. win S already
  if (sPowerFarmer > sPowerSupporter) {
    await ctx.ui.writeMessage(
      `sbattle ${mineId}: explorer power higher ${sPowerFarmer} vs ${sPowerSupporter} and assit can not play s. nothing to do`
    );
    return null;
  }

  const minAtk = powerOf(sCellInfo.helper[0]);
  const poriInfo = _pickOneMinRewardLevelAndAtkGtXPori(parseMineInfo, minAtk);
  if (!poriInfo) {
    await ctx.ui.writeMessage(
      `sbattle ${mineId}: don't have pori atk > ${minAtk}. nothing to do`
    );
    return null;
  }

  await ctx.ui.writeMessage(
    `sbattle ${mineId}: move min rewardLevel -> S. ${poriInfo.id} - R:${poriInfo.rewardLevel} - Pw:${poriInfo.power}`
  );
  return {
    missionId: mineId,
    srcIds: [poriInfo.id],
    desIds: [0],
    sTreasureIndex: sIndex,
  };
}

function _parseMineInfo(mineInfo: AdventureInfoEx) {
  const farmerPories = mineInfo.farmerPories || [];
  const farmerRewardLevel = mineInfo.farmerRewardLevel || [];
  const farmerSlots = mineInfo.farmerSlots || [];
  const supporterPories = mineInfo.supporterPories || [];
  const supporterRewardLevel = mineInfo.supporterRewardLevel || [];
  const supporterSlots = mineInfo.supporterSlots || [];
  const mineId = mineInfo.mineId;

  const activeIndexs = [
    ...(mineInfo?.farmerSlots || []),
    ...(mineInfo?.supporterSlots || []),
  ];
  const activeRewardLevels = [...farmerRewardLevel, ...supporterRewardLevel];
  const sIndex = activeIndexs[activeRewardLevels.indexOf(4)];
  const powerOf = (id: number | string) => {
    return mineInfo.powers[id.toString()];
  };

  const farmerPoriesSortedByDecPower = sortBy(
    farmerPories.map((itm, index) => ({
      id: itm,
      index,
      power: powerOf(itm),
      rewardLevel: farmerRewardLevel[index],
    })),
    (a) => a.power
  ).reverse();
  const supporterPoriesSortedByDecPower = sortBy(
    supporterPories.map((itm, index) => ({
      id: itm,
      index,
      power: powerOf(itm),
      rewardLevel: supporterRewardLevel[index],
    })),
    (a) => a.power
  ).reverse();

  const farmerMaxPowerOf2 =
    farmerPoriesSortedByDecPower[0].power +
    farmerPoriesSortedByDecPower[1].power;

  const supporterMaxPowerOf2 =
    supporterPoriesSortedByDecPower[0].power +
    supporterPoriesSortedByDecPower[1].power;

  return {
    mineId,
    sIndex,
    hasS: !!sIndex,
    farmerPories,
    farmerRewardLevel,
    farmerSlots,
    supporterPories,
    supporterRewardLevel,
    supporterSlots,

    farmerPoriesSortedByDecPower,
    supporterPoriesSortedByDecPower,
    farmerMaxPowerOf2,
    supporterMaxPowerOf2,
    powerOf,
  };
}

function _pickOneMinRewardLevelPori(mineInfo: ParseMineInfo) {
  const { farmerPoriesSortedByDecPower } = mineInfo;
  const res = minBy(farmerPoriesSortedByDecPower, (itm) => itm.rewardLevel);

  if (!res) return null;
  return res.id;
}

function _pickOneMinRewardLevelAndAtkGtXPori(
  mineInfo: ParseMineInfo,
  minAtk: number
) {
  const { farmerPoriesSortedByDecPower } = mineInfo;
  const tmp = farmerPoriesSortedByDecPower.filter((itm) => itm.power > minAtk);
  const res = minBy(tmp, (itm) => itm.rewardLevel);
  if (!res) return null;
  return res;
}

function _pickSMinimizeLoss(
  farmerPoriesSortedByDecPower: {
    id: number;
    index: number;
    power: number;
    rewardLevel: number;
  }[],
  supporterMaxPowerOf2: number
) {
  const arr = farmerPoriesSortedByDecPower.reverse();
  let max1 = farmerPoriesSortedByDecPower[0],
    max2 = farmerPoriesSortedByDecPower[1];
  let maxSum = 0,
    minCost = Number.MAX_VALUE;

  for (let i = 0; i < arr.length - 1; i++) {
    const p1 = arr[i];
    for (let j = i + 1; j < arr.length; j++) {
      const p2 = arr[j];

      if (
        maxSum < p1.power + p2.power &&
        p1.power + p2.power > supporterMaxPowerOf2 &&
        minCost > p1.rewardLevel + p2.rewardLevel
      ) {
        max1 = p1;
        max2 = p2;
        maxSum = p1.power + p2.power;
        minCost = p1.rewardLevel + p2.rewardLevel;
      }
    }
  }
  return { maxSum, minCost, max1, max2 };
}
