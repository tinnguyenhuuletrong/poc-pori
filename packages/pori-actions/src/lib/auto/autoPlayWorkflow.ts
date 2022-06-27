import {
  Workflow,
  Adventure,
  Computed,
  Cmds,
  WalletActions,
} from '../../index';
import { AdventureInfoEx, Context } from '@pori-and-friends/pori-metadata';
import {
  doTaskWithRetry,
  isArrayIncludeAll,
  waitForMs,
} from '@pori-and-friends/utils';
import { uniq } from 'lodash';
import moment from 'moment';
import { queryMissiontOfPoriSc } from '../adventure';
import { AdventureStatsComputed } from '../computed/myAdventure';
const ESB_P_THRESHOLD_KEEP_BIG_REWARD = 15;
const MAX_PORI_ENGAGED_MISSION = 500;

export type AutoPlayOpenMineArgs = {
  type: 'bot';
  minePories: string[];
  supportPori: string;
  timeOutHours: number;
  usePortal: boolean;
};
export type AutoPlayRefreshStatusArg = {
  type: 'background_refresh';
  intervalMs: number;
};

export type AutoPlayArgs = AutoPlayOpenMineArgs | AutoPlayRefreshStatusArg;
export const AutoPlayDb: Record<
  string,
  { args: AutoPlayArgs; state: Workflow.WorkflowState }
> = {};

export function stopBot(id: string) {
  const botInfo = AutoPlayDb[id];
  if (!botInfo) return;
  botInfo.state.abort();
  delete AutoPlayDb[id];
}

function captureStartedBot(state: Workflow.WorkflowState, args: AutoPlayArgs) {
  const id = state.id;
  state.finishDefered.promise
    .then((res) => {
      console.log('bot finish');
    })
    .catch((err) => {
      console.log('bot error', err);
    })
    .finally(() => {
      delete AutoPlayDb[id];
    });
  AutoPlayDb[id] = { state, args };
}

export async function autoRefreshStatus({
  ctx,
  realm,
  playerAddress,
  args,
}: {
  ctx: Context;
  realm: Realm;
  playerAddress: string;
  args: AutoPlayRefreshStatusArg;
}) {
  const intervalMs = args.intervalMs;
  const botId = `auto_refresh`;
  if (AutoPlayDb[botId]) {
    ctx.ui.writeMessage(`bot with id ${botId} is running. skip it`);
    return;
  }

  const workflowExec = async (state: Workflow.WorkflowState) => {
    let count = 0;
    state.updateState(() => {
      state.data['_it'] = count;
      state.data['_nextAt'] = new Date(Date.now() + intervalMs);
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await takeABreak(state, ctx, intervalMs);
      await state.promiseWithAbort(
        refreshStatus(state, realm, ctx, playerAddress)
      );

      state.updateState(() => {
        count++;
        state.data['_it'] = count;
        state.data['_nextAt'] = new Date(Date.now() + intervalMs);
      });
    }
  };

  const state = Workflow.createWorkflow(workflowExec, botId);
  state
    .start()
    .catch((err) => {
      ctx.ui.writeMessage(
        `autoRefresh #bot${state.id} error ${err.toString()}`
      );
    })
    .finally(() => {
      ctx.ui.writeMessage(`autoRefresh #bot${state.id} end!`);
    });

  ctx.ui.writeMessage(
    `autoRefresh #bot${state.id} started:
  - Interval: ${intervalMs / (1 * 60 * 1000)} mins
  `
  );

  captureStartedBot(state, args);
  return state;
}

export async function autoPlayV1({
  ctx,
  realm,
  playerAddress,
  args,
}: {
  ctx: Context;
  realm: Realm;
  playerAddress: string;
  args: AutoPlayOpenMineArgs;
}) {
  const { minePories, supportPori, timeOutHours } = args;
  const start = Date.now();
  const end = start + timeOutHours * 60 * 60 * 1000;
  const botId = `bot_${[...args.minePories, args.supportPori].join('_')}`;
  if (AutoPlayDb[botId]) {
    ctx.ui.writeMessage(`bot with id ${botId} is running. skip it`);
    return;
  }

  const workflowExec = async (state: Workflow.WorkflowState) => {
    while (Date.now() < end) {
      let addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      let activeMine = findActiveMine({ ctx, addvStats, args });
      if (!activeMine) {
        state.updateState(() => {
          state.data['step'] = 'start_mine';
        });

        await state.promiseWithAbort(waitForGasPrice({ ctx, end, state }));

        await state.promiseWithAbort(
          checkPoriMissionCapping({ ctx, args, state })
        );

        // 1. start new mine with portal
        await state.promiseWithAbort(
          Cmds.cmdDoMine({
            ctx,
            realm,
            args: args.usePortal ? '1' : '0',
            minePories,
          })
        );
        state.updateState(() => {
          state.data['step'] = 'start_mine_finish';
        });
      }

      // 2. do support
      addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      activeMine = findActiveMine({ ctx, addvStats, args });
      if (!activeMine) {
        console.log(addvStats);
        throw 'OoO';
      }
      const mineId = activeMine.mineId;
      const nextSupportAt = activeMine.atkAt;
      const shouldSupport = moment(nextSupportAt || 0).isAfter();
      if (shouldSupport) {
        state.updateState(() => {
          state.data[
            'step'
          ] = `waiting_for_support. Wakeup at ${nextSupportAt.toLocaleString()} - ${moment(
            nextSupportAt
          ).fromNow()}`;
        });
        await state.promiseWithAbort(
          waitForMs(
            nextSupportAt.valueOf() -
              Date.now() +
              ctx.setting.autoPlayMicroDelayMs
          )
        );

        if (supportPori) {
          state.updateState(() => {
            state.data['step'] = 'begin_support';
          });
          await state.promiseWithAbort(
            doSupport(ctx, mineId, supportPori, realm)
          );
          state.updateState(() => {
            state.data['step'] = 'end_support';
          });
        }
      }

      // 3. do finish
      addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      activeMine = findActiveMine({ ctx, addvStats, args });
      if (activeMine) {
        state.updateState(() => {
          state.data[
            'step'
          ] = `waiting_for_finish. Wakeup at ${activeMine?.blockedTo.toLocaleString()} - ${moment(
            activeMine?.blockedTo
          ).fromNow()}`;
        });
        await state.promiseWithAbort(
          waitForMs(
            activeMine.blockedTo.valueOf() -
              Date.now() +
              ctx.setting.autoPlayMicroDelayMs
          )
        );

        await state.promiseWithAbort(waitForGasPrice({ ctx, end, state }));

        state.updateState(() => {
          state.data['step'] = 'begin_finish';
        });
        await state.promiseWithAbort(
          doFinishWithRetry(ctx, realm, mineId, state)
        );
        state.updateState(() => {
          state.data['step'] = 'end_finish';
        });
      }

      // done 1 loop
      await takeABreak(state, ctx);
    }
  };

  const state = Workflow.createWorkflow(workflowExec, botId);
  state.onChange = () => {
    ctx.ui.writeMessage(`autoPlay #bot${state.id} step ${state.data['step']}`);
  };

  state
    .start()
    .catch((err) => {
      ctx.ui.writeMessage(`autoPlay #bot${state.id} error ${err.toString()}`);
    })
    .finally(() => {
      ctx.ui.writeMessage(`autoPlay #bot${state.id} end!`);
    });

  ctx.ui.writeMessage(
    `autoPlay #bot${state.id} started:
  - BeginAt: ${new Date(start).toLocaleString()}
  - BeginEnd: ${new Date(end).toLocaleString()}
  - Duration: ${timeOutHours} hours
  `
  );

  captureStartedBot(state, args);
  return state;
}

async function refreshStatus(
  state: Workflow.WorkflowState,
  realm: Realm,
  ctx: Context,
  playerAddress: string
) {
  await takeABreak(state, ctx);
  return await Computed.MyAdventure.refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );
}

async function takeABreak(
  state: Workflow.WorkflowState,
  ctx: Context,
  sec?: number
) {
  await state.promiseWithAbort(
    waitForMs(sec ?? ctx.setting.autoPlayMicroDelayMs)
  );
}

async function waitForGasPrice({
  ctx,
  end,
  state,
}: {
  ctx: Context;
  end: number;
  state: Workflow.WorkflowState;
}) {
  const sleepInterval = 60000;
  const msgInfo = await ctx.ui.writeMessage(`checking gas...`);
  while (Date.now() < end) {
    const web3GasPrice = await WalletActions.currentGasPrice({ ctx });
    const valueInGweith = ctx.web3.utils.toWei(
      ctx.setting.safeGweith.toString(),
      'gwei'
    );

    if (+web3GasPrice > +valueInGweith) {
      ctx.ui.editMessage(
        msgInfo,
        `gas price higher than expected ${web3GasPrice} > ${valueInGweith}. Check again after ${sleepInterval}ms`
      );
      await state.promiseWithAbort(waitForMs(sleepInterval));
      continue;
    }

    ctx.ui.editMessage(msgInfo, `gas price ${web3GasPrice} is safe to go`);
    break;
  }
}

async function checkPoriMissionCapping({
  ctx,
  args,
  state,
}: {
  ctx: Context;
  args: AutoPlayOpenMineArgs;
  state: Workflow.WorkflowState;
}) {
  const pories = [...args.minePories];
  if (args.supportPori) pories.push(args.supportPori);
  const msgInfo = await ctx.ui.writeMessage(`checking pories capping...`);
  let maxMission = -1;
  for (const it of pories) {
    const missionCount = await queryMissiontOfPoriSc(ctx, it);
    if (missionCount > maxMission) maxMission = missionCount;
    if (missionCount > MAX_PORI_ENGAGED_MISSION) {
      throw new Error(`Pori mission capping reach ${it}: ${missionCount}`);
    }
  }
  ctx.ui.editMessage(
    msgInfo,
    `capping is safe to go. Current cap ${maxMission}/${MAX_PORI_ENGAGED_MISSION}`
  );
}

//----------------------------------------------------------//
// internal
//----------------------------------------------------------//
async function doSupport(
  ctx: Context,
  mineId: number,
  SUPPORT_PORI: string,
  realm: Realm
) {
  await Cmds.cmdDoSupport({
    ctx,
    realm,
    args: `${mineId}`,
    SUPPORT_PORI,
    customSlotPick: supportSlotPick,
  });
}

async function doFinishWithRetry(
  ctx: Context,
  realm: Realm,
  mineId: number,
  state: Workflow.WorkflowState
) {
  const doJob = async () => {
    await Cmds.cmdDoFinish({ ctx, realm, args: `${mineId}` });
  };

  await doTaskWithRetry(2, doJob, (err, retryNo) => {
    ctx.ui.writeMessage(
      `autoPlay #bot${state.id} retry no ${retryNo} cmdDoFinish after error ${err.message}`
    );
  });
}

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
async function supportSlotPick({
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
function findActiveMine({
  ctx,
  addvStats,
  args,
}: {
  ctx: Context;
  args: AutoPlayOpenMineArgs;
  addvStats: AdventureStatsComputed;
}): AdventureInfoEx | null {
  const minePories = [...args.minePories].map((itm) => itm.toString()).sort();

  for (const key in addvStats.mines) {
    const mineInfo = addvStats.mines[key];
    const farmerPories = (mineInfo.farmerPories || [])
      .map((itm) => itm.toString())
      .sort();

    const isMatch = isArrayIncludeAll(farmerPories, minePories);
    if (isMatch) return mineInfo;
  }
  return null;
}
