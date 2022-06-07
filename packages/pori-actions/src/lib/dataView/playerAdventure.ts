import type Realm from 'realm';
import {
  IdleGameSCEventDataModel,
  DataViewRepo,
  DataViewModel,
  PoriRepo,
} from '@pori-and-friends/pori-repositories';
import {
  AdventureFinishedData,
  AdventureFortifiedData,
  AdventureInfo,
  AdventureInfoEx,
  AdventureStartedData,
  AdventureStatsGroupByDay,
  AdventureSupported1Data,
  AdventureSupported2Data,
  calculateMineTurnTime,
  EIdleGameSCEventType,
} from '@pori-and-friends/pori-metadata';
import moment from 'moment';

const TOKEN_DECIMAL = 18;
const TOKEN_CONVERT_CONSTANT = 10 ** TOKEN_DECIMAL;

const HEAD_VERSION = '1';
export interface IComputePlayerAdventureProps {
  realm: Realm;
  playerAddress: string;
  realmEventStore: Realm.Results<IdleGameSCEventDataModel & Realm.Object>;
}

export interface ActiveAdventureComputed {
  playerAddress: string;
  note: {
    lastMine?: number;
    lastMineUnlockAt?: Date;
  };
  activeAdventures: Record<number, AdventureInfo>;
  finishedAdventures: Record<number, AdventureStatsGroupByDay>;
}

export async function computePlayerAdventure(
  options: IComputePlayerAdventureProps
) {
  const { realm, playerAddress } = options;
  const viewId = computeViewId(options);
  const lastViewIns = await getLastView(options);
  const { cursor } = lastViewIns;
  const viewData = JSON.parse(lastViewIns.data) as ActiveAdventureComputed;

  const allEvents = options.realmEventStore.filtered(
    `
      _id > oid(${cursor}) && (
        type="AdventureStarted" ||
        type="AdventureSupported1" ||
        type="AdventureFortified" ||
        type="AdventureSupported2" ||
        type="AdventureFinished"
      )
    `
  );

  if (allEvents.length <= 0) return viewData;
  console.log('need to process', { playerAddress, count: allEvents.length });
  for (const it of allEvents) {
    switch (it.type) {
      case EIdleGameSCEventType.AdventureStarted:
        {
          const evData = it.data as AdventureStartedData;
          const isFarmer = evData.farmer === playerAddress;

          viewData.activeAdventures[evData.mineId] = {
            mineId: evData.mineId,
            state: 'AdventureStarted',

            isFarmer,
            farmerAddress: evData.farmer,
            startTime: new Date(evData.startTime * 1000),
            farmerEndTime: new Date(evData.blockedTime * 1000),

            farmerPories: [...evData.porians],
            farmerRewardLevel: [...evData.rewardLevels],
            farmerSlots: [...evData.indexes],
          };
        }
        break;

      case EIdleGameSCEventType.AdventureSupported1:
        {
          const evData = it.data as AdventureSupported1Data;
          const isSupporter = evData.helper === playerAddress;
          const mineInfo = viewData.activeAdventures[evData.mineId];

          if (!mineInfo) {
            console.log('missing', evData.mineId);
            break;
          }

          // not interesting
          if (!(isSupporter || mineInfo.isFarmer)) {
            delete viewData.activeAdventures[evData.mineId];
            break;
          }

          viewData.activeAdventures[evData.mineId] = {
            ...mineInfo,
            state: 'AdventureSupported1',
            isSupporter,
            supporterEndTime: new Date(evData.blockedTime * 1000),
            supporterAddress: evData.helper,

            supporterPories: evData.porians,
            supporterRewardLevel: evData.rewardLevels,
            supporterSlots: evData.indexes,
          };
        }
        break;

      case EIdleGameSCEventType.AdventureFortified:
        {
          const evData = it.data as AdventureFortifiedData;
          const mineInfo = viewData.activeAdventures[evData.mineId];

          // not interesting
          if (!mineInfo) break;
          if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
            delete viewData.activeAdventures[evData.mineId];
            break;
          }

          viewData.activeAdventures[evData.mineId] = {
            ...mineInfo,
            state: 'AdventureFortified',

            farmerEndTime: new Date(evData.blockedTime * 1000),

            // add more pori
            farmerPories: [...(mineInfo.farmerPories ?? []), evData.porian],
            farmerRewardLevel: [
              ...(mineInfo.farmerRewardLevel ?? []),
              evData.rewardLevel,
            ],
            farmerSlots: [...(mineInfo.farmerSlots ?? []), evData.index],
          };
        }
        break;

      case EIdleGameSCEventType.AdventureSupported2:
        {
          const evData = it.data as AdventureSupported2Data;
          const mineInfo = viewData.activeAdventures[evData.mineId];

          // not interesting
          if (!mineInfo) break;
          if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
            delete viewData.activeAdventures[evData.mineId];
            break;
          }

          viewData.activeAdventures[evData.mineId] = {
            ...mineInfo,
            state: 'AdventureSupported2',

            supporterEndTime: new Date(evData.blockedTime * 1000),

            // add more pori
            supporterPories: [
              ...(mineInfo.supporterPories ?? []),
              evData.porian,
            ],
            supporterRewardLevel: [
              ...(mineInfo.supporterRewardLevel ?? []),
              evData.rewardLevel,
            ],
            supporterSlots: [...(mineInfo.supporterSlots ?? []), evData.index],
          };
        }
        break;

      case EIdleGameSCEventType.AdventureFinished:
        {
          const evData = it.data as AdventureFinishedData;
          const mineInfo = viewData.activeAdventures[evData.mineId];

          // not interesting
          if (!mineInfo) break;
          if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
            delete viewData.activeAdventures[evData.mineId];
            break;
          }

          delete viewData.activeAdventures[evData.mineId];
          const dateNo = moment(
            mineInfo.isSupporter
              ? mineInfo.supporterEndTime
              : mineInfo.farmerEndTime
          )
            .startOf('D')
            .unix();

          const previous = viewData.finishedAdventures[dateNo] || {
            unixDay: dateNo,
            timestamp: new Date(dateNo * 1000),
            finishedMineIds: [],
            totalRigy: 0,
            totalRiken: 0,
          };

          const rigyReward = mineInfo.isSupporter
            ? evData.helperReward1
            : evData.farmerReward1;
          const rikenReward = mineInfo.isSupporter
            ? evData.helperReward2
            : evData.farmerReward2;

          viewData.finishedAdventures[dateNo] = {
            ...previous,
            finishedMineIds: [...previous.finishedMineIds, mineInfo.mineId],
            totalRigy:
              previous.totalRigy +
              parseFloat(rigyReward.toString()) / TOKEN_CONVERT_CONSTANT,
            totalRiken:
              previous.totalRiken +
              parseFloat(rikenReward.toString()) / TOKEN_CONVERT_CONSTANT,
          };

          // add note
          const prevNote = viewData.note ?? {};
          viewData.note = {
            ...prevNote,
            lastMine: mineInfo.mineId,
            lastMineUnlockAt: mineInfo.isSupporter
              ? mineInfo.supporterEndTime
              : mineInfo.farmerEndTime,
          };
        }
        break;

      default:
        break;
    }
  }

  DataViewRepo.txSync(realm, () => {
    lastViewIns.cursor = allEvents[allEvents.length - 1]._id.toHexString();
    lastViewIns.data = JSON.stringify(viewData);
  });

  return viewData;
}

async function getLastView(options: IComputePlayerAdventureProps) {
  const { realm } = options;
  const viewId = computeViewId(options);

  let viewIns = await DataViewRepo.findOne(realm, viewId);
  if (!viewIns) {
    const defaultData = DataViewModel.generate(
      viewId,
      '000000000000000000000000',
      defaultViewData(options),
      HEAD_VERSION
    );
    viewIns = await DataViewRepo.createWithTx(realm, defaultData);
  }

  return viewIns;
}

function computeViewId(options: IComputePlayerAdventureProps) {
  return `player:adventure:${options.playerAddress}`;
}

function defaultViewData(
  options: IComputePlayerAdventureProps
): ActiveAdventureComputed {
  return {
    playerAddress: options.playerAddress,
    activeAdventures: {},
    finishedAdventures: {},
    note: {},
  };
}

export function humanrizeAdventureInfo(
  realm: Realm,
  advIno: AdventureInfo,
  withPoriePower = false
): AdventureInfoEx {
  const startTime = advIno.startTime
    ? new Date(advIno.startTime).toLocaleString()
    : undefined;
  const farmerEndTime = advIno.farmerEndTime
    ? new Date(advIno.farmerEndTime).toLocaleString()
    : undefined;
  const supporterEndTime = advIno.supporterEndTime
    ? new Date(advIno.supporterEndTime).toLocaleString()
    : undefined;

  let canCollect = undefined;
  const now = Date.now();
  if (advIno.isFarmer && advIno.farmerEndTime) {
    canCollect = now > new Date(advIno.farmerEndTime).valueOf();
  }
  if (advIno.isSupporter && advIno.supporterEndTime) {
    canCollect = now > new Date(advIno.supporterEndTime).valueOf();
  }

  const blockedTo = advIno.isFarmer
    ? new Date(advIno.farmerEndTime)
    : new Date(advIno.supporterEndTime as any);

  const link = `https://adventure.poriverse.io/missions/${advIno.mineId}`;
  const hasBigRewardFarmer =
    (advIno.farmerRewardLevel?.filter((itm) => itm >= 4).length ?? 0) > 0;
  const hasBigRewardSupporter =
    (advIno.supporterRewardLevel?.filter((itm) => itm >= 4).length ?? 0) > 0;

  const turnTime: any = {};
  const { farmerAtkStartAt, supporterAtkStartAt } = calculateMineTurnTime(
    new Date(advIno.startTime || '')
  );

  turnTime.farmerAtkTime = farmerAtkStartAt.toLocaleString();
  turnTime.supporterAtkTime = supporterAtkStartAt.toLocaleString();

  // calculate pories power
  const powers: Record<string, number> = {};
  if (withPoriePower) {
    const farmerPories = advIno.farmerPories ?? [];
    for (const id of farmerPories) {
      const info = PoriRepo.findOneSync(realm, id);
      if (info) powers[id] = info.minePower;
    }
    const supportPories = advIno.supporterPories ?? [];
    for (const id of supportPories) {
      const info = PoriRepo.findOneSync(realm, id);
      if (info) powers[id] = info.helpPower;
    }
  }

  return {
    link,
    canCollect,
    hasBigReward: hasBigRewardFarmer || hasBigRewardSupporter,
    ...advIno,
    startTime,
    farmerEndTime,
    supporterEndTime,
    ...turnTime,
    atkAt: advIno.isFarmer ? farmerAtkStartAt : supporterAtkStartAt,
    blockedTo,
    powers,
  };
}

export function humanrizeNote(data: ActiveAdventureComputed) {
  const note = data.note || {};
  const res: any = {
    ...note,
  };

  if (note.lastMineUnlockAt) {
    const tmp = new Date(note.lastMineUnlockAt);
    res.lastMineUnlockAt = tmp.toLocaleString();
    res.readyToStart = Date.now() > tmp.valueOf();
  }
  return res;
}

//--------------------------------------------------------------
// Note:
// all events

//  -> create
//     -> new mineObj

// -> support 1
//     -> update

//   if support != me || farmer != me => delete

// -> porify
//   if have mine -> update

// -> support 2
//   if have mine -> update

// -> finish
//   if have mine -> update + capture reward -> delete
