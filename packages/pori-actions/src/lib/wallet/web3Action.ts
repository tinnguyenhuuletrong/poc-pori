import TelegramBot from 'node-telegram-bot-api';
import type { TransactionConfig, TransactionReceipt } from 'web3-core';
import type { ITxData } from '@walletconnect/types';
import { Context } from '@pori-and-friends/pori-metadata';
import { waitForMs } from '@pori-and-friends/utils';

export function sendRequestForWalletConnectTx(
  { ctx }: { ctx: Context },
  tx: ITxData,
  onTxReceipt?: (r: TransactionReceipt) => void
) {
  if (ctx.walletAcc) return useAccountToSendTx(ctx, tx, onTxReceipt);
  return useWalletConnectToSendTx(ctx, tx);
}

async function useAccountToSendTx(
  ctx: Context,
  tx: ITxData,
  onTxReceipt?: (r: TransactionReceipt) => void
) {
  if (!ctx.walletAcc) return;

  const gasFactor = ctx.setting.gasFactor ?? 1;

  const defaultWeb3GasPrice = await ctx.web3.eth.getGasPrice();
  const defaultNonce = await ctx.web3.eth.getTransactionCount(
    ctx.walletAcc.address
  );

  const baseGas = Math.round(+defaultWeb3GasPrice * gasFactor);

  if (!tx.gasPrice && gasFactor !== 1) {
    await ctx.ui.writeMessage(
      `warning: with gasFactor = ${gasFactor}. total gas price = ${baseGas}`
    );
  }

  const web3Tx: TransactionConfig = {
    from: ctx.walletAcc.address,
    to: tx.to,
    data: tx.data, // Required
    gas: tx.gas || '600000',
    gasPrice: tx.gasPrice || baseGas,
    nonce: tx.nonce ? parseInt(tx.nonce.toString()) : defaultNonce,
  };
  const signedTx = await ctx.walletAcc.signTransaction(web3Tx);

  if (signedTx.rawTransaction) {
    const txInfo = ctx.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    txInfo.on('receipt', (r) => onTxReceipt && onTxReceipt(r));
    return (await txInfo).transactionHash;
  }
  return;
}

function useWalletConnectToSendTx(ctx: Context, tx: ITxData) {
  if (!ctx.walletConnectChannel) return;
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
  if (!ctx.walletAcc) return;

  const defaultWeb3GasPrice = await ctx.web3.eth.getGasPrice();
  const defaultNonce = await ctx.web3.eth.getTransactionCount(
    ctx.walletAcc.address
  );

  const web3Tx: TransactionConfig = {
    from: ctx.walletAcc.address,
    to: tx.to,
    data: tx.data, // Required
    gas: tx.gas || '600000',
    gasPrice: tx.gasPrice || defaultWeb3GasPrice,
    nonce: tx.nonce ? parseInt(tx.nonce.toString()) : defaultNonce,
  };
  const signedTx = await ctx.walletAcc.signTransaction(web3Tx);
  if (signedTx.rawTransaction) {
    return signedTx.rawTransaction.split('0x')[1];
  }
  return signedTx.rawTransaction;
}

function useWalletConnectToSignTx(ctx: Context, tx: ITxData) {
  if (!ctx.walletConnectChannel) return;
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

  return false;
}
