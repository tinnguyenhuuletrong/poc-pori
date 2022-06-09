import { Deferred } from '@pori-and-friends/utils';

export type WorkflowState = {
  id: string;
  startAt: Date;
  finishAt?: Date;
  error?: Error;
  data: Record<string, any>;
  currentStep: string;
  finishDefered: Deferred;
  abort: () => void;
  start: () => Promise<any>;
  onChange?: (flowState: WorkflowState) => void;
  updateState: (func: () => void) => void;
  promiseWithAbort: (p: Promise<any>) => Promise<any>;
};

export type FlowExec = (state: WorkflowState) => Promise<void>;

export function createWorkflow(exec: FlowExec): WorkflowState {
  const cancelDefered = new Deferred();
  const finishDefered = new Deferred();

  const state: WorkflowState = {
    id: `workflow_simple_${Date.now()}`,
    startAt: new Date(),
    data: {},
    currentStep: '0',
    finishDefered,
    abort: () =>
      cancelDefered.reject && cancelDefered.reject(new Error('aborted')),
    start: () => {
      doJob();
      return finishDefered.promise;
    },
    updateState: (func: () => void) => {
      func();
      state.onChange && state.onChange(state);
    },
    promiseWithAbort: (p: Promise<any>): Promise<any> =>
      Promise.race([p, cancelDefered.promise]),
  };

  const doJob = async () => {
    try {
      await exec(state);

      state.updateState(() => {
        state.finishAt = new Date();
      });

      finishDefered.resolve(null);
    } catch (error) {
      state.updateState(() => {
        state.error = error as Error;
      });
      finishDefered.reject(error);
    }
  };

  return state;
}
