import type Realm from 'realm';
import {
  IdleGameSCEventDataModel,
  DataViewRepo,
  DataViewModel,
} from '@pori-and-friends/pori-repositories';
import {
  AdventureFinishedData,
  AdventureFortifiedData,
  AdventureInfo,
  AdventureInfoEx,
  AdventureStartedData,
  AdventureSupported1Data,
  AdventureSupported2Data,
  calculateMineTurnTime,
  EIdleGameSCEventType,
} from '@pori-and-friends/pori-metadata';

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
  finishedAdventures: Record<number, AdventureInfo>;
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
      _id >= oid(${cursor}) && (
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
          viewData.finishedAdventures[evData.mineId] = {
            ...mineInfo,
            state: 'AdventureFinished',

            // todo add reward
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

  DataViewRepo.tx(realm, () => {
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

export function humanrizeAdventureInfo(advIno: AdventureInfo): AdventureInfoEx {
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
