import { Context } from '@pori-and-friends/pori-metadata';
import TelegramBot from 'node-telegram-bot-api';
import * as Repos from '@pori-and-friends/pori-repositories';
import {
  schedulerNotifyMineFinishId,
  schedulerNotifyMineFinishIdType,
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

    if (!(chatId && msgData)) return;
    await bot.sendMessage(chatId, msgData);
  };

  scheduler.addHandler(schedulerNotifyMineFinishIdType, doSendNotify);
}

export async function addWorkerTaskForMineEndNotify({
  ctx,
  realm,
  scheduler,
  chatId,
  mineId,
  endAt,
  pnMessage = 'ready for new action',
}: {
  ctx: Context;
  realm: Realm;
  scheduler: Repos.SchedulerService;
  chatId: number;
  mineId: number;
  endAt: Date;
  pnMessage: string;
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
    codeName: schedulerNotifyMineFinishIdType,
    runAt: endAt,
    params: JSON.stringify({ chatId, msgData: pnMessage }),
    _id: mineEndSchedulerId,
  });
}
