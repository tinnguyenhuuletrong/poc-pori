import { Workflow } from '../../index';
import { Context } from '@pori-and-friends/pori-metadata';
import { AutoPlayDb, captureStartedBot, takeABreak } from './autoPlayWorkflow';

export type StartBotFuncHandler = () => Promise<void>;
export type AutoKeepAliveBotArgs = {
  type: 'keep_alive_bot';
  intervalMs: number;
  botDb: Record<string, StartBotFuncHandler>;
};

export async function autoKeepAliveBot({
  ctx,
  realm,
  args,
}: {
  ctx: Context;
  realm: Realm;
  args: AutoKeepAliveBotArgs;
}) {
  const intervalMs = args.intervalMs;
  const botId = `keep_alive_bot`;
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

      for (const id in args.botDb) {
        if (AutoPlayDb[id]) continue;

        ctx.ui.writeMessage(`${botId} restart bot ${id}`);
        await args.botDb[id]();
      }

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
        `keepAliveBot #bot${state.id} error ${err.toString()}`
      );
    })
    .finally(() => {
      ctx.ui.writeMessage(`keepAliveBot #bot${state.id} end!`);
    });

  ctx.ui.writeMessage(
    `keepAliveBot #bot${state.id} started:
    - Interval: ${intervalMs / (1 * 60 * 1000)} mins
    `
  );

  captureStartedBot(state, args);
  return state;
}
