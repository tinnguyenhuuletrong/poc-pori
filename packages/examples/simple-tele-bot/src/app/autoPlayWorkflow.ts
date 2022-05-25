import { Workflow } from '@pori-and-friends/pori-actions';
import { Context } from '@pori-and-friends/pori-metadata';
import { waitForMs } from '@pori-and-friends/utils';
import { isEmpty } from 'lodash';
import type TelegramBot from 'node-telegram-bot-api';
import { cmdDoFinish, cmdDoMine, cmdDoSupport } from './cmds';
import { refreshAdventureStatsForAddress } from './computed';
const MICRO_DELAY_MS = 2000;

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
      // 1. start new mine with portal
      await state.promiseWithAbort(
        cmdDoMine({ ctx, realm, bot, msg, args: '1' })
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
        state.data['step'] = 'waiting_for_support';
      });
      await state.promiseWithAbort(
        waitForMs(nextSupportAt.valueOf() - Date.now() + MICRO_DELAY_MS)
      );

      state.updateState(() => {
        state.data['step'] = 'begin_support';
      });
      await state.promiseWithAbort(
        cmdDoSupport({ ctx, realm, bot, msg, args: `${mineId}` })
      );
      state.updateState(() => {
        state.data['step'] = 'end_support';
      });

      // 3. do finish
      addvStats = await refreshStatus(state, realm, ctx, playerAddress);
      activeMine = addvStats.mines[Object.keys(addvStats.mines)[0]];

      state.updateState(() => {
        state.data['step'] = 'waiting_for_finish';
      });
      await state.promiseWithAbort(
        waitForMs(activeMine.blockedTo.valueOf() - Date.now() + MICRO_DELAY_MS)
      );
      state.updateState(() => {
        state.data['step'] = 'begin_finish';
      });
      await state.promiseWithAbort(
        cmdDoFinish({ ctx, realm, bot, msg, args: `${mineId}` })
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
  return await refreshAdventureStatsForAddress({ realm, ctx }, playerAddress);
}

async function takeABreak(state: Workflow.WorkflowState) {
  await state.promiseWithAbort(waitForMs(MICRO_DELAY_MS));
}
