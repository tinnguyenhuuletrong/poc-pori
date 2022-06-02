import { Adventure } from '@pori-and-friends/pori-actions';
import { Context, getIdleGameAddressSC } from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import type { ITxData } from '@walletconnect/types';
import { uniq } from 'lodash';
import TelegramBot from 'node-telegram-bot-api';
import { refreshAdventureStatsForAddress } from './computed';
import {
  env,
  FORMATION,
  MINE_ATK_PRICE_FACTOR,
  playerAddress,
  schedulerNewMineId,
  schedulerNewMineType,
  SUPPORT_PORI,
} from './config';
import {
  boolFromString,
  currentGasPrice,
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
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
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
    from: ctx.walletAcc.address,
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
  };

  if (!ctx.walletAcc)
    await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
    bot.sendMessage(msg.chat.id, `on Receipt: ${r.transactionHash}`);
  });
  if (txHash)
    await bot.sendMessage(msg.chat.id, `https://polygonscan.com/tx/${txHash}`);
  else await bot.sendMessage(msg.chat.id, `Ố ồ..`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdDoFinish({
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
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }

  const tmp = args.split(' ');
  const mineId = parseInt(tmp[0]);
  if (Number.isNaN(mineId)) {
    return await bot.sendMessage(msg.chat.id, `Usage: /finish <mineId>`);
  }

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );

  const mineInfo = addvStats.targets[mineId];
  if (!mineInfo) {
    console.log('opps. Mine status changed');
    await bot.sendMessage(
      msg.chat.id,
      `opps. Mine status changed. Already finished....`
    );
    return;
  }

  await bot.sendMessage(msg.chat.id, `roger that!. Finish mine: ${mineId}`);

  const callData = ctx.contract.methods
    .finish(
      // poriants
      mineId
    )
    .encodeABI();

  console.log({
    mineId,
  });

  const tx = {
    from: ctx.walletAcc.address,
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
  };

  if (!ctx.walletAcc)
    await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
    bot.sendMessage(msg.chat.id, `on Receipt: ${r.transactionHash}`);
  });
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
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
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
    from: ctx.walletAcc.address,
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
    gasPrice: +web3GasPrice * factor,
  };

  if (!ctx.walletAcc)
    await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
    bot.sendMessage(msg.chat.id, `on Receipt: ${r.transactionHash}`);
  });
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
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }
  const currentGasWei = await currentGasPrice({ ctx });

  const tmp = args.split(' ');
  if (tmp.length !== 2) {
    return await bot.sendMessage(
      msg.chat.id,
      `Usage: /sch_mine <usePortal> [gasPriceGwei]`
    );
  }

  const usePortal = boolFromString(tmp[0]);
  let gasPriceInWei: string | number = parseInt(tmp[1]);

  if (Number.isNaN(gasPriceInWei)) {
    gasPriceInWei = currentGasWei;
  } else {
    gasPriceInWei = ctx.web3.utils.toWei(gasPriceInWei.toString(), 'gwei');
  }

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );

  const now = new Date();
  const nextActionTime = new Date(addvStats.nextActionAtDate);

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

  const nonce = await ctx.web3.eth.getTransactionCount(ctx.walletAcc.address);

  await bot.sendMessage(
    msg.chat.id,
    `roger that!. Schedule to start new mine. 
    schedulerId:${scheduleId} 
    usePortal:**${usePortal}**
    at: ${scheduleAt.toLocaleString()}
    gas: **${gasPriceInWei}**
    nonce: ${nonce}
    `
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

  const tx: ITxData = {
    from: ctx.walletAcc.address,
    to: getIdleGameAddressSC(env).address,
    data: callData, // Required
    nonce: nonce,
    gasPrice: gasPriceInWei,
  };

  if (!ctx.walletAcc)
    await bot.sendMessage(msg.chat.id, `Sir! please sign tx in trust wallet`);

  const signedTx = await sendSignRequestForWalletConnectTx({ ctx }, tx);
  if (!signedTx) return await bot.sendMessage(msg.chat.id, `Ó Ò`);

  await scheduler.scheduleJob(realm, {
    codeName: schedulerNewMineType,
    runAt: scheduleAt,
    params: JSON.stringify({ signedTx: signedTx, chatId: msg.chat.id }),
    _id: scheduleId,
  });

  await bot.sendMessage(msg.chat.id, `Schedule registered!`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

// args: mineId
// const args = match[1];
// TODO:
//      supporter: support2(mineId, porian, index)
//      farmer: fortify(mineId, porian, index)

// IF has bigReward (level = 4 at index i)
//    Support this index
// Else
//    Random remaining slots

export async function cmdDoSupport({
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
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }

  const tmp = args.split(' ');
  const mineId = tmp[0];
  if (!mineId) {
    await bot.sendMessage(msg.chat.id, '\tUsage: /mine_support <mineId>');
    return;
  }

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );

  const mineInfo = addvStats.mines[mineId];
  if (!mineInfo) {
    console.log('opps. Mine status changed');
    await bot.sendMessage(msg.chat.id, `opps. Mine not found`);
    return;
  }
  const isFarmer = mineInfo.isFarmer;
  const activeIndexs = [
    ...(mineInfo?.farmerSlots || []),
    ...(mineInfo?.supporterSlots || []),
  ];
  const activeRewardLevels = [
    ...(mineInfo?.farmerRewardLevel || []),
    ...(mineInfo?.supporterRewardLevel || []),
  ];

  const bigRewardIndex = activeIndexs[activeRewardLevels.indexOf(4)];

  const pori = SUPPORT_PORI;
  const slotIndex = bigRewardIndex
    ? bigRewardIndex
    : Adventure.randAdventureSlot(1, uniq(activeIndexs))[0];

  console.log({
    isFarmer,
    activeIndexs,
    activeRewardLevels,
    bigRewardIndex,
    pori,
    slotIndex,
  });
  await bot.sendMessage(
    msg.chat.id,
    `roger that!. send pori ${pori} to support mineId:${mineId} at ${slotIndex} (bigRewardIndex: ${bigRewardIndex})`
  );

  let callDataAbi = '';
  if (isFarmer) {
    callDataAbi = ctx.contract.methods
      .fortify(mineId, pori, slotIndex)
      .encodeABI();
  } else
    callDataAbi = ctx.contract.methods
      .support2(mineId, pori, slotIndex)
      .encodeABI();

  const tx = {
    from: ctx.walletAcc.address,
    to: getIdleGameAddressSC(env).address,
    data: callDataAbi, // Required
  };

  if (!ctx.walletAcc)
    await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
    bot.sendMessage(msg.chat.id, `on Receipt: ${r.transactionHash}`);
  });
  if (txHash)
    await bot.sendMessage(msg.chat.id, `https://polygonscan.com/tx/${txHash}`);
  else await bot.sendMessage(msg.chat.id, `Ố ồ..`);
}
