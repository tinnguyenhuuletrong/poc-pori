import { Input, DataView, WalletActions, token2Usd } from '../../index';
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
import { queryPortalInfoSc, SCPortalInfo } from '../adventure';
import { URL } from 'url';

const QUICK_CHART_URL =
  'https://quickchart.io/chart/render/sm-d5f8d67a-d271-4d30-9ae1-be744bd2627e';

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
  portalInfo?: SCPortalInfo;
  price?: {
    rigy2Usd: number;
    rken2Usd: number;
  };
};

export async function refreshAdventureStatsForAddress(
  {
    realm,
    ctx,
    options = {
      withGasPrice: false,
      withPortal: false,
      withPrice: false,
    },
  }: {
    realm: Realm;
    ctx: Context;
    options?: {
      withGasPrice?: boolean;
      withPortal?: boolean;
      withPrice?: boolean;
    };
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
      humanView.mines[k] = DataView.humanrizeAdventureInfo(
        ctx,
        realm,
        value,
        true
      );
    else if (value.state === 'AdventureStarted') {
      humanView.targets[k] = DataView.humanrizeAdventureInfo(ctx, realm, value);
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

  if (options.withGasPrice) {
    const web3GasPrice = await WalletActions.currentGasPrice({ ctx });
    humanView.gasPriceGWEI = ctx.web3.utils.fromWei(web3GasPrice, 'gwei');
  }

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

  // portal
  if (options.withPortal) {
    humanView.portalInfo = await queryPortalInfoSc(ctx, addr);
  }

  // price
  if (options.withPrice) {
    humanView.price = await token2Usd(ctx);
    if (humanView.todayStats) {
      humanView.todayStats.rigyUsd =
        humanView.todayStats.totalRigy * humanView.price.rigy2Usd;
      humanView.todayStats.rikenUsd =
        humanView.todayStats.totalRiken * humanView.price.rken2Usd;
    }
  }

  return humanView;
}

export async function genLast7DaysGraphData({
  ctx,
  realm,
  playerAddress,
}: {
  ctx: Context;
  realm: Realm;
  playerAddress: string;
}) {
  const viewData = await DataView.computePlayerAdventure({
    realm,
    playerAddress: playerAddress,
    realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
  });
  const entries = Object.entries(viewData.finishedAdventures);

  const last7Days = entries
    .map((itm) => itm[1])
    .sort((a, b) => b.unixDay - a.unixDay)
    .slice(0, 7)
    .reverse();

  const graphData: { labels: string[]; data1: string[]; data2: string[] } = {
    labels: [],
    data1: [],
    data2: [],
  };
  for (const it of last7Days) {
    const tmp = moment(it.timestamp).format('MMM-DD');
    graphData.labels.push(tmp);
    graphData.data1.push(Math.round(it.totalRigy).toString());
    graphData.data2.push(Math.round(it.totalRiken).toString());
  }

  const url = new URL(QUICK_CHART_URL);
  url.searchParams.append('labels', graphData.labels.join(','));
  url.searchParams.append('data1', graphData.data1.join(','));

  return { graphData, url: url.toString() };
}
