import { Input, DataView, WalletActions } from '../../index';
import * as Repos from '@pori-and-friends/pori-repositories';
import {
  AdventureInfoEx,
  AdventureInfo,
  Context,
  getIdleGameAddressSC,
  AdventureStatsGroupByDay,
} from '@pori-and-friends/pori-metadata';
import { maxBy, minBy } from 'lodash';
import moment from 'moment';

export type ProtentialTarget = {
  link: string;
  mineId: number;
  hasBigReward: boolean;
  startTimeLocalTime: string;
  startTime: Date;
  sinceSec: number;
};

export type AdventureStatsComputed = {
  note: any;
  mines: Record<string, AdventureInfoEx>;
  targets: Record<string, AdventureInfoEx>;
  protentialTarget: ProtentialTarget[];
  activeMines: number;
  canDoNextAction: boolean;
  nextActionAt: string;
  nextAtkAt: string;
  nextActionAtDate?: Date;
  nextAtkAtDate?: Date;
  gasPriceGWEI: string;
  todayStats?: AdventureStatsGroupByDay;
};

export async function refreshAdventureStatsForAddress(
  {
    realm,
    ctx,
  }: {
    realm: Realm;
    ctx: Context;
  },
  addr: string
): Promise<AdventureStatsComputed> {
  const createdBlock = getIdleGameAddressSC(ctx.env).createdBlock;
  await Input.updateEventDb(realm, ctx, {
    createdBlock,
  });

  const activeAddr = addr;
  const now = Date.now();

  const viewData = await DataView.computePlayerAdventure({
    realm,
    playerAddress: activeAddr,
    realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
  });

  // humanView
  const humanView: AdventureStatsComputed = {
    note: DataView.humanrizeNote(viewData),

    // my active adventures
    mines: {} as Record<string, AdventureInfoEx>,

    // protential target
    targets: {},
    protentialTarget: [],
    activeMines: 0,
    canDoNextAction: false,
    nextActionAt: '',
    nextActionAtDate: new Date(),
    nextAtkAt: '',
    nextAtkAtDate: new Date(),
    gasPriceGWEI: '',
  };

  for (const k of Object.keys(viewData.activeAdventures)) {
    const value = viewData.activeAdventures[k as any] as AdventureInfo;
    if (
      value.farmerAddress === activeAddr ||
      value.supporterAddress === activeAddr
    )
      humanView.mines[k] = DataView.humanrizeAdventureInfo(realm, value, true);
    else if (value.state === 'AdventureStarted') {
      humanView.targets[k] = DataView.humanrizeAdventureInfo(realm, value);
    }
  }

  humanView.protentialTarget = Object.keys(humanView.targets)
    .map((key) => {
      const val = humanView.targets[key];
      const sinceSec = (now - new Date(val.startTime ?? 0).valueOf()) / 1000;
      return {
        link: val.link,
        mineId: val.mineId,
        hasBigReward: val.hasBigReward,
        startTimeLocalTime: new Date(val.startTime ?? 0).toLocaleString(),
        startTime: new Date(val.startTime ?? 0),
        sinceSec,
      };
    })
    .sort((a, b) => {
      return +a.hasBigReward - +b.hasBigReward;
    });

  humanView.activeMines = Object.keys(humanView.mines).length;

  // mine completed by farmer. But our poriant still lock
  if (humanView.note.readyToStart === false) humanView.activeMines++;

  const web3GasPrice = await WalletActions.currentGasPrice({ ctx });
  humanView.gasPriceGWEI = ctx.web3.utils.fromWei(web3GasPrice, 'gwei');

  // next action timeline
  const timeViewMine = Object.values(humanView.mines);
  const noBlock = timeViewMine.every((itm) => {
    return !!itm.canCollect;
  });
  const nextActionAt = maxBy(timeViewMine, (v) =>
    v.blockedTo.valueOf()
  )?.blockedTo;

  const nextAtkAt = minBy(
    timeViewMine.filter((itm) => itm.atkAt.valueOf() > now),
    (v) => v.atkAt.valueOf()
  )?.atkAt;

  humanView.canDoNextAction = humanView.note.readyToStart && noBlock;
  if (nextActionAt) {
    humanView.nextActionAt = `${nextActionAt.toLocaleString()} - ${moment(
      nextActionAt
    ).fromNow()}`;
  }
  humanView.nextActionAtDate = nextActionAt;

  if (nextAtkAt) {
    humanView.nextAtkAt = `${nextAtkAt.toLocaleString()} - ${moment(
      nextAtkAt
    ).fromNow()}`;
  }
  humanView.nextAtkAtDate = nextAtkAt;

  // stats
  const toDayNo = moment().startOf('D').unix();
  humanView.todayStats = viewData.finishedAdventures[toDayNo];

  return humanView;
}
