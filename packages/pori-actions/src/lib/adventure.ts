import { Context, PromiseReturnType } from '@pori-and-friends/pori-metadata';
import { random } from 'lodash';

const ALL_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function randAdventureSlot(
  samples: number,
  excludeIndex: number[] = []
) {
  let pool = ALL_SLOTS.filter((itm) => !excludeIndex.includes(itm));

  const res = [];
  for (let i = 0; i < samples; i++) {
    const next = pool[random(0, pool.length - 1, false)];
    if (!next) throw new Error('not enough pool');

    pool = pool.filter((v) => v !== next);
    res.push(next);
  }

  return res;
}

export type SCMineInfo = PromiseReturnType<
  ReturnType<typeof queryMineinfoFromSc>
>;
export async function queryMineinfoFromSc(ctx: Context, mineId: number) {
  const res = await ctx.contract.methods.mines(mineId - 1).call();
  const farmer = parseMinePlayer(ctx, res.farmer);
  const helper = parseMinePlayer(ctx, res.helper);
  const rewardMap = parseRewardMap(ctx, res.rewardMap);
  return {
    farmer,
    helper,
    rewardMap,
  };
}

function parseMinePlayer(ctx: Context, playerInfo: any) {
  const address = playerInfo.player;
  const selectedIndex = ctx.web3.utils
    .hexToBytes(playerInfo.selectedCells)
    .filter((itm) => itm > 0);
  return {
    address,
    selectedIndex,
  };
}

function parseRewardMap(ctx: Context, rawRewardMap: string) {
  const bytes = ctx.web3.utils.hexToBytes(rawRewardMap);
  const env = byte2number(bytes.slice(0, 2));
  const startTimeUnixSec = byte2number(bytes.slice(20, 28));

  const slots: Record<string, { reward: number; joined: number }> = {};
  const startOffset = 2;
  for (let i = 0; i < 9; i++) {
    const reward = bytes[startOffset + i * 2];
    const joined = bytes[startOffset + i * 2 + 1];
    slots[i] = { reward, joined };
  }

  return {
    env,
    startTimeUnixSec,
    startTimeInDate: new Date(startTimeUnixSec * 1000),
    slots,
    mineRawRewadMap: rawRewardMap,
  };
}

function byte2number(bytes: number[]) {
  return parseInt(Buffer.from(bytes).toString('hex'), 16);
}

export async function queryRandomRewardLevelFromSc(
  ctx: Context,
  mineInfo: SCMineInfo
) {
  return ctx.contract.methods
    .randomRewardLevel(mineInfo.rewardMap.mineRawRewadMap)
    .call();
}

export async function queryMissiontOfPoriSc(
  ctx: Context,
  pori: string | number
) {
  const engagedMission = await ctx.contract.methods.missionOfPori(pori).call();
  return parseInt(engagedMission);
}

export type SCPortalInfo = PromiseReturnType<
  ReturnType<typeof queryPortalInfoSc>
>;
export async function queryPortalInfoSc(ctx: Context, addr: string) {
  const info = await ctx.contractPortal.methods.portalInfoOf(addr).call();
  const { missions, fastMissions, capacityMissions } = info;
  return {
    missions: parseInt(missions),
    fastMissions: parseInt(fastMissions),
    capacityMissions: parseInt(capacityMissions),
  };
}
