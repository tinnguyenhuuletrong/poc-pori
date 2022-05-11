import { Adventure } from '@pori-and-friends/pori-actions';
import { Context, getIdleGameAddressSC } from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import type { ITxData } from '@walletconnect/types';
import TelegramBot from 'node-telegram-bot-api';
import { refreshAdventureStatsForAddress } from './computed';
import {
  env,
  FORMATION,
  MINE_ATK_PRICE_FACTOR,
  playerAddress,
  schedulerNewMineId,
  schedulerNewMineType,
} from './config';
import {
  boolFromString,
  sendRequestForWalletConnectTx,
  sendSignRequestForWalletConnectTx,
} from './utils';

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdDoMine({
  ctx,
  realm,
  bot,
  msg,
  args,
}: {
  ctx: Context;
  realm: Realm;
  args: string;
  bot: TelegramBot;
  msg: TelegramBot.Message;
}) {
  if (!ctx.walletConnectChannel?.connected) {
    console.warn('wallet channel not ready. Please run .wallet.start first');
    return;
  }

  const tmp = args.split(' ');
  const usePortal = boolFromString(tmp[0]);

  const poriants = FORMATION;
  const index = Adventure.randAdventureSlot(3);

  await bot.sendMessage(
    msg.chat.id,
    `roger that!. Start new mine. usePortal:${usePortal}`
  );

  const callData = ctx.contract.methods
    .startAdventure(
      // poriants
      poriants,

      // index
      index,

      // notPortal
      !usePortal
    )
    .encodeABI();

  console.log({
    poriants,
    index,
    usePortal,
  });

  const tx = {
    from: ctx.walletConnectChannel.accounts[0],
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
  };

  await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await sendRequestForWalletConnectTx({ ctx }, tx);
  if (txHash)
    await bot.sendMessage(msg.chat.id, `https://polygonscan.com/tx/${txHash}`);
  else await bot.sendMessage(msg.chat.id, `Ố ồ..`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdDoAtk({
  ctx,
  realm,
  bot,
  msg,
  args,
}: {
  ctx: Context;
  realm: Realm;
  args: string;
  bot: TelegramBot;
  msg: TelegramBot.Message;
}) {
  if (!ctx.walletConnectChannel?.connected) {
    console.warn('wallet channel not ready. Please run .wallet.start first');
    return;
  }
  const tmp = args.split(' ');
  const mineId = tmp[0];
  const usePortal = boolFromString(tmp[1]);
  if (!mineId) {
    await bot.sendMessage(
      msg.chat.id,
      '\tUsage: /atk <mineId> [usePortal = false]'
    );
    return;
  }

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );

  await bot.sendMessage(
    msg.chat.id,
    `roger that!. Start atk mineId:${mineId} usePortal:${usePortal}`
  );
  console.log({ mineId, usePortal });
  const mineInfo = addvStats.targets[mineId];

  if (!mineInfo) {
    console.log('opps. Mine status changed');
    await bot.sendMessage(
      msg.chat.id,
      `opps. Mine status changed. Retreat....`
    );
    return;
  }

  const poriants = FORMATION;
  const index = Adventure.randAdventureSlot(3, mineInfo.farmerSlots);

  const callData = ctx.contract.methods
    .support1(
      // mineId
      mineId,
      // poriants
      poriants,

      // index
      index,

      // notPortal
      !usePortal
    )
    .encodeABI();

  console.log({
    method: 'support1',
    mineId,
    poriants,
    index,
    usePortal,
    callData,
  });

  const web3GasPrice = await ctx.web3.eth.getGasPrice();
  const factor = MINE_ATK_PRICE_FACTOR;

  const tx: ITxData = {
    from: ctx.walletConnectChannel.accounts[0],
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
    gasPrice: +web3GasPrice * factor,
  };

  await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await sendRequestForWalletConnectTx({ ctx }, tx);
  if (txHash)
    await bot.sendMessage(msg.chat.id, `https://polygonscan.com/tx/${txHash}`);
  else await bot.sendMessage(msg.chat.id, `Ố ồ..`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdScheduleOpenMine({
  ctx,
  realm,
  scheduler,
  bot,
  msg,
  args,
}: {
  ctx: Context;
  realm: Realm;
  scheduler: Repos.SchedulerService;
  args: string;
  bot: TelegramBot;
  msg: TelegramBot.Message;
}) {
  if (!ctx.walletConnectChannel?.connected) {
    console.warn('wallet channel not ready. Please run .wallet.start first');
    return;
  }
  const tmp = args.split(' ');
  const usePortal = boolFromString(tmp[0]);

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );

  const now = new Date();
  const nextActionTime = new Date(addvStats.nextActionAt);

  if (now.valueOf() > nextActionTime.valueOf()) {
    await bot.sendMessage(
      msg.chat.id,
      `No need to schedule sir. You can order to start by using cmd /atk or /mine`
    );
    return;
  }
  const scheduleAt = new Date(nextActionTime.valueOf() + 1 * 60 * 1000);

  const poriants = FORMATION;
  const index = Adventure.randAdventureSlot(3);
  const scheduleId = schedulerNewMineId();

  await bot.sendMessage(
    msg.chat.id,
    `roger that!. Schedule to start new mine. schedulerId:${scheduleId} usePortal:${usePortal} at ${scheduleAt.toLocaleString()}`
  );

  const callData = ctx.contract.methods
    .startAdventure(
      // poriants
      poriants,

      // index
      index,

      // notPortal
      !usePortal
    )
    .encodeABI();

  console.log({
    poriants,
    index,
    usePortal,
  });

  const tx = {
    from: ctx.walletConnectChannel.accounts[0],
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
  };

  await bot.sendMessage(msg.chat.id, `Sir! please sign tx in trust wallet`);

  const signedTx = await sendSignRequestForWalletConnectTx({ ctx }, tx);
  await scheduler.scheduleJob(realm, {
    codeName: schedulerNewMineType,
    runAt: scheduleAt,
    params: signedTx,
    _id: scheduleId,
  });

  await bot.sendMessage(msg.chat.id, `Schedule registered!`);
}
