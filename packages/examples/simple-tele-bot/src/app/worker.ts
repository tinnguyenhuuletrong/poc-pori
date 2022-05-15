import { Context } from '@pori-and-friends/pori-metadata';
import TelegramBot from 'node-telegram-bot-api';
import * as Repos from '@pori-and-friends/pori-repositories';
import {
  schedulerNewMineType,
  schedulerNotifyMineAtkId,
  schedulerNotifyMineFinishId,
  schedulerNotifyMineNotifyIdType,
} from './config';

export function registerWorkerNotify({
  ctx,
  realm,
  scheduler,
  bot,
}: {
  ctx: Context;
  realm: Realm;
  scheduler: Repos.SchedulerService;
  bot: TelegramBot;
}) {
  const doSendNotify = async (job: Repos.ScheduleJobModel) => {
    const { _id, params } = job;
    const paramObj = JSON.parse(params);
    const chatId = paramObj?.chatId;
    const msgData = paramObj?.msgData;
    const extra = (paramObj?.extra || {}) as TelegramBot.SendMessageOptions;

    if (!(chatId && msgData)) return;
    await bot.sendMessage(chatId, msgData, extra);
  };

  scheduler.addHandler(schedulerNotifyMineNotifyIdType, doSendNotify);
}

export async function addWorkerTaskForMineEndNotify({
  ctx,
  realm,
  scheduler,
  chatId,
  mineId,
  endAt,
  pnMessage = 'ready for new action',
  extra = {},
}: {
  ctx: Context;
  realm: Realm;
  scheduler: Repos.SchedulerService;
  chatId: number;
  mineId: number;
  endAt: Date;
  pnMessage: string;
  extra: TelegramBot.SendMessageOptions;
}) {
  const mineEndSchedulerId = schedulerNotifyMineFinishId(mineId);
  const jobIns = await scheduler.getJobById(realm, mineEndSchedulerId);

  // already have it
  if (
    jobIns &&
    !jobIns.hasFinish &&
    jobIns.runAt.valueOf() === endAt.valueOf()
  ) {
    return;
  }

  // Register new job
  await scheduler.scheduleJob(realm, {
    codeName: schedulerNotifyMineNotifyIdType,
    runAt: endAt,
    params: JSON.stringify({ chatId, msgData: pnMessage, extra }),
    _id: mineEndSchedulerId,
  });
}

export async function addWorkerTaskForMineAtkNotify({
  ctx,
  realm,
  scheduler,
  chatId,
  mineId,
  endAt,
  pnMessage = 'ready for new action',
  extra = {},
}: {
  ctx: Context;
  realm: Realm;
  scheduler: Repos.SchedulerService;
  chatId: number;
  mineId: number;
  endAt: Date;
  pnMessage: string;
  extra: TelegramBot.SendMessageOptions;
}) {
  const mineAtkSchedulerId = schedulerNotifyMineAtkId(mineId);
  const jobIns = await scheduler.getJobById(realm, mineAtkSchedulerId);

  // already have it
  if (
    jobIns &&
    !jobIns.hasFinish &&
    jobIns.runAt.valueOf() === endAt.valueOf()
  ) {
    return;
  }

  // Register new job
  await scheduler.scheduleJob(realm, {
    codeName: schedulerNotifyMineNotifyIdType,
    runAt: endAt,
    params: JSON.stringify({ chatId, msgData: pnMessage, extra }),
    _id: mineAtkSchedulerId,
  });
}

export function registerWorkerStartNewMine({
  ctx,
  realm,
  scheduler,
  bot,
}: {
  ctx: Context;
  realm: Realm;
  scheduler: Repos.SchedulerService;
  bot: TelegramBot;
}) {
  const doSendNotify = async (job: Repos.ScheduleJobModel) => {
    const { _id, params } = job;
    const paramObj = JSON.parse(params);
    const chatId = paramObj?.chatId;
    const signedTx = paramObj?.signedTx;

    if (!(chatId && signedTx)) return;
    await bot.sendMessage(chatId, `${schedulerNewMineType} begin`);

    try {
      const txInfo = await ctx.web3.eth
        .sendSignedTransaction(`0x${signedTx}`)
        .on('receipt', (info) => {
          bot.sendMessage(
            chatId,
            `${schedulerNewMineType} submited at. https://polygonscan.com/tx/${info.transactionHash}`
          );
        });

      await bot.sendMessage(
        chatId,
        `${schedulerNewMineType} success. https://polygonscan.com/tx/${txInfo.transactionHash}`
      );
    } catch (error) {
      await bot.sendMessage(
        chatId,
        `${schedulerNewMineType} error. ${error.message}`
      );
    }
  };

  scheduler.addHandler(schedulerNewMineType, doSendNotify);
}
