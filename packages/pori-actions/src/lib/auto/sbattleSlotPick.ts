import { Adventure } from '../../index';
import { AdventureInfoEx, Context } from '@pori-and-friends/pori-metadata';
import { uniq } from 'lodash';
import { ESB_P_THRESHOLD_KEEP_BIG_REWARD } from './autoPlayWorkflow';

/*
  SBattle
  1. make-sure 2 team have 4 pories => null
  2. query 
      Adventure.getPoriansAtSCellSc -> {sFarmer, sHelper}
      2MaxFarmerPower, 2MaxSupportPower
  3. if esb(Sum(2MaxFarmerPower) , Sum(2MaxSupportPower)) < 15 => null

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
*/

export type SBattlerDecision = {
  missionId: number;
  srcIds: number[];
  desIds: number[];
  sTreasureIndex: number;
};
export async function sbattleSlotPick({
  mineInfo,
  isFarmer,
  ctx,
}: {
  mineInfo: AdventureInfoEx;
  isFarmer: boolean;
  ctx: Context;
}): Promise<SBattlerDecision | null> {
  return null;
}
