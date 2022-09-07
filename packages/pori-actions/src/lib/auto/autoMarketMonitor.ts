import { queryMarketItems } from '../queryPoriApi';
import { Workflow } from '../../index';
import {
  Context,
  getMarketplayBaseLink,
  NFTItemPotionIds,
  NFTItemSeedIds,
  TEN_POWER_10_BN,
} from '@pori-and-friends/pori-metadata';
import { isEmpty } from 'lodash';
import { AutoPlayDb, captureStartedBot, takeABreak } from './autoPlayWorkflow';

export type AutoMonitorMarketItemPriceArgs = {
  type: 'market_items_monitor';
  intervalMs: number;
  minSeedToNotice: number;
  minPotionToNotice: number;
};

export async function autoMonitorMarketItemPrices({
  ctx,
  realm,
  args,
}: {
  ctx: Context;
  realm: Realm;
  args: AutoMonitorMarketItemPriceArgs;
}) {
  const intervalMs = args.intervalMs;
  const botId = `market_items_monitor`;
  if (AutoPlayDb[botId]) {
    ctx.ui.writeMessage(`bot with id ${botId} is running. skip it`);
    return;
  }

  const workflowExec = async (state: Workflow.WorkflowState) => {
    let count = 0;
    state.updateState(() => {
      state.data['_it'] = count;
      state.data['_nextAt'] = new Date(Date.now() + intervalMs);
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await takeABreak(state, ctx, intervalMs);

      await checkMarketItems(ctx, args, state);

      state.updateState(() => {
        count++;
        state.data['_it'] = count;
        state.data['_nextAt'] = new Date(Date.now() + intervalMs);
      });
    }
  };

  const state = Workflow.createWorkflow(workflowExec, botId);
  state
    .start()
    .catch((err) => {
      ctx.ui.writeMessage(
        `marketPriceMonitor #bot${state.id} error ${err.toString()}`
      );
    })
    .finally(() => {
      ctx.ui.writeMessage(`marketPriceMonitor #bot${state.id} end!`);
    });

  ctx.ui.writeMessage(
    `marketPriceMonitor #bot${state.id} started:
    - Interval: ${intervalMs / (1 * 60 * 1000)} mins
    `
  );

  captureStartedBot(state, args);
  return state;
}

async function checkMarketItems(
  ctx: Context,
  args: AutoMonitorMarketItemPriceArgs,
  state: Workflow.WorkflowState
) {
  const sellingItems = await queryMarketItems({ ctx, pageSize: 35 });
  const marketplaceBaseUrl = getMarketplayBaseLink(ctx.env);

  const seenItems = state.data['seenItems'] || {};

  const seedItems = sellingItems
    .filter((itm) => NFTItemSeedIds.includes(+itm.itemType.id))
    .filter((itm) => {
      const price = BigInt(itm.unitPrice) / TEN_POWER_10_BN;
      const isLowerThan = price <= args.minSeedToNotice;
      const hasSeen = !!seenItems[itm.id];

      return isLowerThan && !hasSeen;
    });

  const potionItems = sellingItems
    .filter((itm) => NFTItemPotionIds.includes(+itm.itemType.id))
    .filter((itm) => {
      const price = BigInt(itm.unitPrice) / TEN_POWER_10_BN;
      const isLowerThan = price <= args.minPotionToNotice;
      const hasSeen = !!seenItems[itm.id];

      return isLowerThan && !hasSeen;
    });

  const res = [...seedItems, ...potionItems];
  state.updateState(() => {
    res.forEach((itm) => (seenItems[itm.id] = true));
    state.data['seenItems'] = seenItems;
  });

  if (!isEmpty(res)) {
    const botMasterUid = process.env['TELEGRAM_MASTER_ID'];
    ctx.ui.writeMessage(
      `marketPriceMonitor #bot${state.id} notice:
      [master](tg://user?id=${botMasterUid}) 🌜 items to check:

      ${res
        .map(
          (itm) =>
            `- orderId: ${itm.scOrderId} - ${itm.itemType.name} - price: ${
              BigInt(itm.unitPrice) / TEN_POWER_10_BN
            }`
        )
        .join('\n')}
      `
    );
  }
}
