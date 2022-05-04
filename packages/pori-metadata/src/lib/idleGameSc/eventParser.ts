import {
  toNumber,
  transformArrayElementToNumber,
} from '@pori-and-friends/utils';
import type { EventData } from 'web3-eth-contract';
import {
  AllIdleGameEvents,
  AllIdleGameSCEventData,
  EIdleGameSCEventType,
  IdleGameSCEvent,
} from './type.idleGame';

export function parseIdleGameScEvent(
  eventInfo: EventData
): IdleGameSCEvent | null {
  if (!AllIdleGameEvents.includes(eventInfo.event)) return null;

  const evType = eventInfo.event as EIdleGameSCEventType;
  let data: AllIdleGameSCEventData;

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
        farmerReward1: toNumber(eventInfo.returnValues['farmerReward1']),
        farmerReward2: toNumber(eventInfo.returnValues['farmerReward2']),
        helperReward1: toNumber(eventInfo.returnValues['helperReward1']),
        helperReward2: toNumber(eventInfo.returnValues['helperReward2']),
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
  }

  return {
    type: evType,
    txHash: eventInfo.transactionHash,
    blockNo: eventInfo.blockNumber,
    data,
  };
}
