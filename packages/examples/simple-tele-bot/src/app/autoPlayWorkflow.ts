import {
  Workflow,
  Adventure,
  Computed,
  Cmds,
} from '@pori-and-friends/pori-actions';
import { AdventureInfoEx, Context } from '@pori-and-friends/pori-metadata';
import { doTaskWithRetry, waitForMs } from '@pori-and-friends/utils';
import { isEmpty, uniq } from 'lodash';
import moment from 'moment';
import type TelegramBot from 'node-telegram-bot-api';
import { FORMATION, SUPPORT_PORI } from './config';
const MICRO_DELAY_MS = 2000;
const SAFE_GWEITH = '80';

export async function autoPlayV1({
  ctx,
  realm,
  timeOutHours,
  playerAddress,
  bot,
  msg,
}: {
  ctx: Context;
  realm: Realm;
  timeOutHours: number;
  playerAddress: string;
  bot: TelegramBot;
  msg: TelegramBot.Message;
}) {
  const start = Date.now();
  const end = start + timeOutHours * 60 * 60 * 1000;

  const workflowExec = async (state: Workflow.WorkflowState) => {
    while (Date.now() < end) {
      let addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      const isEmptyMine = isEmpty(addvStats.mines);
      if (!isEmptyMine)
        throw new Error('Please start autoplay when mine empty');

      state.updateState(() => {
        state.data['step'] = 'start_mine';
      });

      await state.promiseWithAbort(
        waitForGasPrice({ ctx, end, bot, msg, state })
      );

      // 1. start new mine with portal
      await state.promiseWithAbort(
        Cmds.cmdDoMine({ ctx, realm, args: '1', FORMATION })
      );
      state.updateState(() => {
        state.data['step'] = 'start_mine_finish';
      });

      // 2. do support
      addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      let activeMine = addvStats.mines[Object.keys(addvStats.mines)[0]];
      const mineId = activeMine.mineId;
      const nextSupportAt = activeMine.atkAt;

      state.updateState(() => {
        state.data[
          'step'
        ] = `waiting_for_support. Wakeup at ${nextSupportAt.toLocaleString()} - ${moment(
          nextSupportAt
        ).fromNow()}`;
      });
      await state.promiseWithAbort(
        waitForMs(nextSupportAt.valueOf() - Date.now() + MICRO_DELAY_MS)
      );

      state.updateState(() => {
        state.data['step'] = 'begin_support';
      });
      await state.promiseWithAbort(doSupport(ctx, bot, msg, mineId, realm));
      state.updateState(() => {
        state.data['step'] = 'end_support';
      });

      // 3. do finish
      addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      activeMine = addvStats.mines[Object.keys(addvStats.mines)[0]];

      state.updateState(() => {
        state.data[
          'step'
        ] = `waiting_for_finish. Wakeup at ${activeMine.blockedTo.toLocaleString()} - ${moment(
          activeMine.blockedTo
        ).fromNow()}`;
      });
      await state.promiseWithAbort(
        waitForMs(activeMine.blockedTo.valueOf() - Date.now() + MICRO_DELAY_MS)
      );

      await state.promiseWithAbort(
        waitForGasPrice({ ctx, end, bot, msg, state })
      );

      state.updateState(() => {
        state.data['step'] = 'begin_finish';
      });
      await state.promiseWithAbort(
        doFinishWithRetry(ctx, realm, bot, msg, mineId, state)
      );
      state.updateState(() => {
        state.data['step'] = 'end_finish';
      });
      // done 1 loop
    }
  };

  const state = Workflow.createWorkflow(workflowExec);
  state.onChange = () => {
    bot.sendMessage(
      msg.chat.id,
      `autoPlay #bot${state.id} step ${state.data['step']}`
    );
  };

  state
    .start()
    .catch((err) => {
      bot.sendMessage(
        msg.chat.id,
        `autoPlay #bot${state.id} error ${err.toString()}`
      );
    })
    .finally(() => {
      bot.sendMessage(msg.chat.id, `autoPlay #bot${state.id} end!`);
    });

  bot.sendMessage(
    msg.chat.id,
    `autoPlay #bot${state.id} started:
  - BeginAt: ${new Date(start).toLocaleString()}
  - BeginEnd: ${new Date(end).toLocaleString()}
  - Duration: ${timeOutHours} hours
  `
  );
  return state;
}

async function refreshStatus(
  state: Workflow.WorkflowState,
  realm: Realm,
  ctx: Context,
  playerAddress: string
) {
  await takeABreak(state);
  return await Computed.MyAdventure.refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );
}

async function takeABreak(state: Workflow.WorkflowState) {
  await state.promiseWithAbort(waitForMs(MICRO_DELAY_MS));
}

async function waitForGasPrice({
  ctx,
  end,
  bot,
  msg,
  state,
}: {
  ctx: Context;
  end: number;
  bot: TelegramBot;
  msg: TelegramBot.Message;
  state: Workflow.WorkflowState;
}) {
  const sleepInterval = 60000;
  const checkMsg = await bot.sendMessage(msg.chat.id, `checking gas...`);
  while (Date.now() < end) {
    const web3GasPrice = await ctx.web3.eth.getGasPrice();
    const valueInGweith = ctx.web3.utils.toWei(SAFE_GWEITH, 'gwei');

    if (+web3GasPrice > +valueInGweith) {
      await bot.editMessageText(
        `gas price higher than expected ${web3GasPrice} > ${valueInGweith}. Check again after ${sleepInterval}ms`,
        {
          chat_id: checkMsg.chat.id,
          message_id: checkMsg.message_id,
        }
      );
      await state.promiseWithAbort(waitForMs(sleepInterval));
      continue;
    }

    await bot.editMessageText(`gas price ${web3GasPrice} is safe to go`, {
      chat_id: checkMsg.chat.id,
      message_id: checkMsg.message_id,
    });
    break;
  }
}

async function guessRewardLevel({
  ctx,
  bot,
  msg,
  mineId,
}: {
  ctx: Context;
  bot: TelegramBot;
  msg: TelegramBot.Message;
  mineId: number;
}) {
  const scMineInfo = await Adventure.queryMineinfoFromSc(ctx, mineId);
  const nextSlotReward = await Adventure.queryRandomRewardLevelFromSc(
    ctx,
    scMineInfo
  );
  await bot.sendMessage(
    msg.chat.id,
    `#guessReward next rewardLevel is ${nextSlotReward}`
  );
}

async function doSupport(
  ctx: Context,
  bot: TelegramBot,
  msg: TelegramBot.Message,
  mineId: number,
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
  bot: TelegramBot,
  msg: TelegramBot.Message,
  mineId: number,
  state: Workflow.WorkflowState
) {
  const doJob = async () => {
    await Cmds.cmdDoFinish({ ctx, realm, args: `${mineId}` });
  };

  await doTaskWithRetry(2, doJob, (err, retryNo) => {
    bot.sendMessage(
      msg.chat.id,
      `autoPlay #bot${state.id} retry no ${retryNo} cmdDoFinish after error ${err.message}`
    );
  });
}

/*
  If has bigReward 
    farmer found: send support to bigReward slot (protect it)
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
  const activeIndexs = [
    ...(mineInfo?.farmerSlots || []),
    ...(mineInfo?.supporterSlots || []),
  ];
  const activeRewardLevels = [
    ...(mineInfo?.farmerRewardLevel || []),
    ...(mineInfo?.supporterRewardLevel || []),
  ];

  let slotIndex!: number;
  const bigRewardIndex = activeIndexs[activeRewardLevels.indexOf(4)];
  const isFarmerFound = (mineInfo?.farmerRewardLevel || []).includes(4);

  if (mineInfo.hasBigReward) {
    if (isFarmerFound) slotIndex = bigRewardIndex;
    else slotIndex = Adventure.randAdventureSlot(1, uniq(activeIndexs))[0];
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
    `roger that!. send pori ${pori} to support mineId:${mineInfo.mineId} at ${slotIndex} (bigRewardIndex: ${bigRewardIndex}, isFarmerFound:${isFarmerFound})`
  );
  return slotIndex;
}
