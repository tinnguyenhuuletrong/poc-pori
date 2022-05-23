import TelegramBot from 'node-telegram-bot-api';
import type { TransactionConfig } from 'web3-core';
import type { ITxData } from '@walletconnect/types';
import { Context } from '@pori-and-friends/pori-metadata';
import { waitForMs } from '@pori-and-friends/utils';

export function sendRequestForWalletConnectTx(
  { ctx }: { ctx: Context },
  tx: ITxData
) {
  if (ctx.walletAcc) return useAccountToSendTx(ctx, tx);
  return useWalletConnectToSendTx(ctx, tx);
}

async function useAccountToSendTx(ctx: Context, tx: ITxData) {
  const web3Tx: TransactionConfig = {
    from: ctx.walletAcc.address,
    to: tx.to,
    data: tx.data, // Required
    gasPrice: tx.gasPrice,
    nonce: tx.nonce ? parseInt(tx.nonce.toString()) : undefined,
  };
  const signedTx = await ctx.walletAcc.signTransaction(web3Tx);
  const txInfo = await ctx.web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );
  return txInfo.transactionHash;
}

function useWalletConnectToSendTx(ctx: Context, tx: ITxData) {
  return ctx.walletConnectChannel
    .sendTransaction(tx)
    .then((result) => {
      return result;
    })
    .then((txInfo) => {
      console.log(txInfo);
      return txInfo;
    })
    .catch((error) => {
      // Error returned when rejected
      console.error(error);
    });
}

export function sendSignRequestForWalletConnectTx(
  { ctx }: { ctx: Context },
  tx: ITxData
) {
  if (ctx.walletAcc) return useAccountToSignTx(ctx, tx);
  return useWalletConnectToSignTx(ctx, tx);
}

async function useAccountToSignTx(ctx: Context, tx: ITxData) {
  const web3Tx: TransactionConfig = {
    from: ctx.walletAcc.address,
    to: tx.to,
    data: tx.data, // Required
    gasPrice: tx.gasPrice,
    nonce: tx.nonce ? parseInt(tx.nonce.toString()) : undefined,
  };
  const signedTx = await ctx.walletAcc.signTransaction(web3Tx);
  return signedTx.rawTransaction;
}

function useWalletConnectToSignTx(ctx: Context, tx: ITxData) {
  return ctx.walletConnectChannel
    .signTransaction(tx)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      // Error returned when rejected
      console.error(error);
      return null;
    });
}

export async function currentGasPrice({ ctx }: { ctx: Context }) {
  return await ctx.web3.eth.getGasPrice();
}

export async function withErrorWrapper(
  { chatId, bot }: { chatId: number; bot: TelegramBot },
  handler: () => Promise<any>
) {
  try {
    await handler();
  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, `Error: ${error.message}`);
  }
}

export function boolFromString(inp) {
  if (inp === '1' || inp === 'true') return true;
  return false;
}

const TIME_4_HOUR_MS = 4 * 60 * 60 * 1000;
export async function monitorTx({
  ctx,
  txHash,
  timeoutMs = TIME_4_HOUR_MS,
}: {
  ctx: Context;
  txHash: string;
  timeoutMs?: number;
}) {
  let shouldRun = true;
  const sleepTimeoutMs = 30 * 1000; // 30 sec

  const now = Date.now();
  const endAt = timeoutMs + now;
  while (shouldRun) {
    const info = await ctx.web3.eth.getTransactionReceipt(txHash);

    // not found receipt -> wrong tx
    if (!info) return false;

    // tx mined
    if (info.blockNumber && info.status) {
      return true;
    }

    // continue waiting
    await waitForMs(sleepTimeoutMs);
    shouldRun = Date.now() > endAt;
  }
}
