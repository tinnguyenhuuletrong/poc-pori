import { Adventure, WalletActions } from '../../index';
import {
  AdventureInfoEx,
  Context,
  getIdleGameAddressSC,
} from '@pori-and-friends/pori-metadata';
import { boolFromString } from '@pori-and-friends/utils';
import type { ITxData } from '@walletconnect/types';
import { uniq } from 'lodash';
import { refreshAdventureStatsForAddress } from '../computed/myAdventure';

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdDoMine({
  ctx,
  realm,
  args,
  minePories,
}: {
  ctx: Context;
  realm: Realm;
  args: string;
  minePories: string[];
}) {
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }

  const tmp = args.split(' ');
  const usePortal = boolFromString(tmp[0]);

  const poriants = minePories;
  const index = Adventure.randAdventureSlot(3);

  await ctx.ui.writeMessage(
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
    to: getIdleGameAddressSC(ctx.env).address,
    data: callData, // Required
  };

  if (!ctx.walletAcc)
    await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await WalletActions.sendRequestForWalletConnectTx(
    { ctx },
    tx,
    (r) => {
      ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    }
  );
  if (txHash) await ctx.ui.writeMessage(`https://polygonscan.com/tx/${txHash}`);
  else await ctx.ui.writeMessage(`Ố ồ..`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdDoFinish({
  ctx,
  realm,
  args,
}: {
  ctx: Context;
  realm: Realm;
  args: string;
}) {
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }

  const tmp = args.split(' ');
  const mineId = parseInt(tmp[0]);
  if (Number.isNaN(mineId)) {
    return await ctx.ui.writeMessage(`Usage: /finish <mineId>`);
  }
  const playerAddress = ctx.playerAddress || '';
  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    playerAddress
  );

  const mineInfo = addvStats.mines[mineId];
  if (!mineInfo) {
    console.log('opps. Mine status changed');
    await ctx.ui.writeMessage(
      `opps. Mine status changed. Already finished....`
    );
    return;
  }

  await ctx.ui.writeMessage(`roger that!. Finish mine: ${mineId}`);

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
    to: getIdleGameAddressSC(ctx.env).address,
    data: callData, // Required
  };

  if (!ctx.walletAcc)
    await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await WalletActions.sendRequestForWalletConnectTx(
    { ctx },
    tx,
    (r) => {
      ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    }
  );
  if (txHash) await ctx.ui.writeMessage(`https://polygonscan.com/tx/${txHash}`);
  else await ctx.ui.writeMessage(`Ố ồ..`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

export async function cmdDoAtk({
  ctx,
  realm,
  FORMATION,
  MINE_ATK_PRICE_FACTOR,
  args,
}: {
  ctx: Context;
  realm: Realm;
  args: string;
  FORMATION: string[];
  MINE_ATK_PRICE_FACTOR: number;
}) {
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }
  const tmp = args.split(' ');
  const mineId = tmp[0];
  const usePortal = boolFromString(tmp[1]);
  if (!mineId) {
    await ctx.ui.writeMessage('\tUsage: /atk <mineId> [usePortal = false]');
    return;
  }

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    ctx.playerAddress || ''
  );

  await ctx.ui.writeMessage(
    `roger that!. Start atk mineId:${mineId} usePortal:${usePortal}`
  );
  console.log({ mineId, usePortal });
  const mineInfo = addvStats.targets[mineId];

  if (!mineInfo) {
    console.log('opps. Mine status changed');
    await ctx.ui.writeMessage(`opps. Mine status changed. Retreat....`);
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
    to: getIdleGameAddressSC(ctx.env).address,
    data: callData, // Required
    gasPrice: +web3GasPrice * factor,
  };

  if (!ctx.walletAcc)
    await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await WalletActions.sendRequestForWalletConnectTx(
    { ctx },
    tx,
    (r) => {
      ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    }
  );
  if (txHash) await ctx.ui.writeMessage(`https://polygonscan.com/tx/${txHash}`);
  else await ctx.ui.writeMessage(`Ố ồ..`);
}

//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//

// args: mineId
// const args = match[1];
//      supporter: support2(mineId, porian, index)
//      farmer: fortify(mineId, porian, index)
export type SupportSlotCalculator = typeof defaultSupportSlotPick;
export async function cmdDoSupport({
  ctx,
  realm,
  args,
  SUPPORT_PORI,
  customSlotPick = defaultSupportSlotPick,
}: {
  ctx: Context;
  realm: Realm;
  args: string;
  SUPPORT_PORI: string;
  customSlotPick?: SupportSlotCalculator;
}) {
  if (!ctx.walletAcc) {
    console.warn('wallet channel not ready. Please run wallet_unlock first');
    return;
  }

  const tmp = args.split(' ');
  const mineId = tmp[0];
  if (!mineId) {
    await ctx.ui.writeMessage('\tUsage: /mine_support <mineId>');
    return;
  }

  const addvStats = await refreshAdventureStatsForAddress(
    { realm, ctx },
    ctx.playerAddress || ''
  );

  const mineInfo = addvStats.mines[mineId];
  if (!mineInfo) {
    console.log('opps. Mine status changed');
    await ctx.ui.writeMessage(`opps. Mine not found`);
    return;
  }
  const isFarmer = mineInfo.isFarmer;
  const pori = SUPPORT_PORI;

  const slotIndex = await customSlotPick({
    mineInfo,
    isFarmer,
    pori,
    ctx,
  });

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
    to: getIdleGameAddressSC(ctx.env).address,
    data: callDataAbi, // Required
  };

  if (!ctx.walletAcc)
    await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);

  // Sign transaction
  const txHash = await WalletActions.sendRequestForWalletConnectTx(
    { ctx },
    tx,
    (r) => {
      ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    }
  );
  if (txHash) await ctx.ui.writeMessage(`https://polygonscan.com/tx/${txHash}`);
  else await ctx.ui.writeMessage(`Ố ồ..`);
}

// IF has bigReward (level = 4 at index i)
//    Support this index
// Else
//    Random remaining slots
async function defaultSupportSlotPick({
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

  const bigRewardIndex = activeIndexs[activeRewardLevels.indexOf(4)];

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
  await ctx.ui.writeMessage(
    `roger that!. send pori ${pori} to support mineId:${mineInfo.mineId} at ${slotIndex} (bigRewardIndex: ${bigRewardIndex})`
  );
  return slotIndex;
}
