import Web3 from 'web3';
import {
  hexToBytes,
  splitPackedHexBy32Bytes,
  toDecimal128,
  toNumber,
  transformArrayElementToNumber,
} from '@pori-and-friends/utils';
import type { EventData } from 'web3-eth-contract';
import {
  AllIdleGameEvents,
  AllIdleGameSCEventData,
  EIdleGameSCEventType,
  IdleGameSCEvent,
  IdleGameSCEventInvSignatureTable,
  SBattleSwapData,
} from './type.idleGame';

export function parseIdleGameScEvent(
  eventInfo: EventData
): IdleGameSCEvent | null {
  // if (!AllIdleGameEvents.includes(eventInfo.event)) return null;

  let evType!: EIdleGameSCEventType;
  let data: AllIdleGameSCEventData;
  if (eventInfo.event) evType = eventInfo.event as EIdleGameSCEventType;
  else {
    const rawTopic = eventInfo.signature || eventInfo.raw.topics[0];
    evType = IdleGameSCEventInvSignatureTable[rawTopic];
  }

  if (!evType) return null;

  switch (evType) {
    case EIdleGameSCEventType.AdventureStarted:
      data = {
        mineId: toNumber(eventInfo.returnValues['mineId']),
        farmer: eventInfo.returnValues['farmer'],
        startTime: toNumber(eventInfo.returnValues['startTime']),
        blockedTime: toNumber(eventInfo.returnValues['blockedTime']),
        porians: transformArrayElementToNumber(
          eventInfo.returnValues['porians']
        ),
        indexes: transformArrayElementToNumber(
          eventInfo.returnValues['indexes']
        ),
        rewardLevels: transformArrayElementToNumber(
          eventInfo.returnValues['rewardLevels']
        ),
      };
      break;

    case EIdleGameSCEventType.AdventureFinished:
      data = {
        mineId: toNumber(eventInfo.returnValues['mineId']),
        winner: eventInfo.returnValues['winner'],
        fragments: toNumber(eventInfo.returnValues['fragments']),
        farmerReward1: toDecimal128(eventInfo.returnValues['farmerReward1']),
        farmerReward2: toDecimal128(eventInfo.returnValues['farmerReward2']),
        helperReward1: toDecimal128(eventInfo.returnValues['helperReward1']),
        helperReward2: toDecimal128(eventInfo.returnValues['helperReward2']),
      };
      break;

    case EIdleGameSCEventType.AdventureFortified:
      data = {
        mineId: toNumber(eventInfo.returnValues['mineId']),
        porian: toNumber(eventInfo.returnValues['porian']),
        index: toNumber(eventInfo.returnValues['index']),
        rewardLevel: toNumber(eventInfo.returnValues['rewardLevel']),
        blockedTime: toNumber(eventInfo.returnValues['blockedTime']),
      };
      break;

    case EIdleGameSCEventType.AdventureSupported1:
      data = {
        mineId: toNumber(eventInfo.returnValues['mineId']),
        helper: eventInfo.returnValues['helper'],
        porians: transformArrayElementToNumber(
          eventInfo.returnValues['porians']
        ),
        indexes: transformArrayElementToNumber(
          eventInfo.returnValues['indexes']
        ),
        rewardLevels: transformArrayElementToNumber(
          eventInfo.returnValues['rewardLevels']
        ),
        blockedTime: toNumber(eventInfo.returnValues['blockedTime']),
      };
      break;

    case EIdleGameSCEventType.AdventureSupported2:
      data = {
        mineId: toNumber(eventInfo.returnValues['mineId']),
        porian: toNumber(eventInfo.returnValues['porian']),
        index: toNumber(eventInfo.returnValues['index']),
        rewardLevel: toNumber(eventInfo.returnValues['rewardLevel']),
        blockedTime: toNumber(eventInfo.returnValues['blockedTime']),
      };
      break;

    case EIdleGameSCEventType.PorianDeposited:
      data = {
        from: eventInfo.returnValues['from'],
        porian: toNumber(eventInfo.returnValues['porian']),
        expiredAt: toNumber(eventInfo.returnValues['expiredAt']),
      };
      break;

    case EIdleGameSCEventType.PorianWithdrawed:
      data = {
        to: eventInfo.returnValues['to'],
        porian: toNumber(eventInfo.returnValues['porian']),
      };
      break;

    case EIdleGameSCEventType.GameDurationChanged:
      data = {
        adventureDuration: toNumber(
          eventInfo.returnValues['adventureDuration']
        ),
        turnDuration: toNumber(eventInfo.returnValues['turnDuration']),
      };
      break;
    case EIdleGameSCEventType.SBattleSwapped:
      data = parseSBattleSwapRawData(eventInfo.raw.data);
      break;
  }

  return {
    type: evType,
    txHash: eventInfo.transactionHash,
    blockNo: eventInfo.blockNumber,
    data,
  };
}

function parseSBattleSwapRawData(rawData: string): SBattleSwapData {
  const tmp = splitPackedHexBy32Bytes(rawData);
  const mineId = parseInt(tmp[0], 16);
  const address = Web3.utils.toChecksumAddress(
    `0x${tmp[1].slice(24, tmp[1].length)}`
  );
  const porian = parseInt(tmp[2], 16);
  const isAP = parseInt(tmp[3], 16) !== 0;
  const fromIndex = parseInt(tmp[4], 16);
  const toIndex = parseInt(tmp[5], 16);

  return {
    mineId,
    farmer: isAP ? undefined : address,
    helper: isAP ? address : undefined,
    porian,
    from: fromIndex.toString(),
    to: toIndex.toString(),
  };
}
