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
import moment from 'moment';
import { queryMissiontOfPoriSc } from '../adventure';
import { AdventureStatsComputed } from '../computed/myAdventure';
import { supportSlotPick } from './supportSlotPick';

export const ESB_P_THRESHOLD_KEEP_BIG_REWARD = 15;
const MAX_PORI_ENGAGED_MISSION = 999;
const SBATTLE_BEFORE_END_MS = 30 * 60 * 1000; // 30 mins

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

        await state.promiseWithAbort(checkGasPrice({ ctx, end, state }));

        await state.promiseWithAbort(
          checkPoriMissionCapping({ ctx, args, state })
        );

        await state.promiseWithAbort(
          checkPortal({ ctx, args, state, end, playerAddress })
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

      // 3. do SBattle. before finish 30 mins
      const sAt = activeMine.blockedTo.valueOf() - SBATTLE_BEFORE_END_MS;
      const needToWaitForSMin =
        sAt - Date.now() + ctx.setting.autoPlayMicroDelayMs;
      if (needToWaitForSMin > 0) {
        state.updateState(() => {
          state.data['step'] = `waiting_for_s. Wakeup at ${new Date(
            sAt
          ).toLocaleString()} - ${moment(new Date(sAt)).fromNow()}`;
        });

        await state.promiseWithAbort(waitForMs(needToWaitForSMin));
        await state.promiseWithAbort(checkGasPrice({ ctx, end, state }));

        state.updateState(() => {
          state.data['step'] = 'begin_s';
        });

        // CMD do SBattle
        await state.promiseWithAbort(
          Cmds.cmdDoSBattle({ ctx, realm, args: mineId.toString() })
        );

        state.updateState(() => {
          state.data['step'] = 'end_s';
        });
      }

      // 4. do finish
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

        await state.promiseWithAbort(checkGasPrice({ ctx, end, state }));

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

//----------------------------------------------------------//
// bot manager
//----------------------------------------------------------//

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

//----------------------------------------------------------//
// internal
//----------------------------------------------------------//

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

async function checkGasPrice({
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

async function checkPortal({
  ctx,
  args,
  playerAddress,
  end,
  state,
}: {
  ctx: Context;
  args: AutoPlayOpenMineArgs;
  playerAddress: string;
  end: number;
  state: Workflow.WorkflowState;
}) {
  if (!args.usePortal) return;
  const msgInfo = await ctx.ui.writeMessage(`checking portal capping...`);
  const sleepInterval = 60000;

  while (Date.now() < end) {
    const portalCap = await Adventure.queryPortalInfoSc(ctx, playerAddress);
    if (portalCap.availableRiken < portalCap.nextMissionRequireRiken) {
      ctx.ui.editMessage(
        msgInfo,
        `portal capping is not enough. ${
          portalCap.availableRiken
        } left. Require ${
          portalCap.nextMissionRequireRiken
        } ... try again after ${sleepInterval / 1000}s`
      );
      await state.promiseWithAbort(waitForMs(sleepInterval));
      continue;
    }
    break;
  }

  ctx.ui.editMessage(msgInfo, `portal capping is safe to go`);
}

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
  // delay 3 sec
  // Porichain time lag ??
  //  0x175b05a99aca3f64fcfad12bc6c60c0392625a3eca08e3a070f17aa3c36b1f7e
  await waitForMs(30 * 1000);

  const doJob = async () => {
    await Cmds.cmdDoFinish({ ctx, realm, args: `${mineId}` });
  };

  await doTaskWithRetry(
    4,
    doJob,
    (err, retryNo) => {
      ctx.ui.writeMessage(
        `autoPlay #bot${state.id} retry no ${retryNo} cmdDoFinish after error ${err.message}`
      );
    },
    60 * 1000
  );
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
