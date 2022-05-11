import TelegramBot from 'node-telegram-bot-api';
import type { ITxData } from '@walletconnect/types';
import { Context } from '@pori-and-friends/pori-metadata';

export function sendRequestForWalletConnectTx(
  { ctx }: { ctx: Context },
  tx: ITxData
) {
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
  return ctx.walletConnectChannel
    .signTransaction(tx)
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
