import { waitForMs } from '@pori-and-friends/utils';
import {
  createWorkflow,
  FlowExec,
  WorkflowState,
} from '../src/lib/workflow/workflowV1';

describe('workflow_concept', () => {
  const exec: FlowExec = async (state: WorkflowState) => {
    const it = 3;
    let sum = 0;
    for (let i = 0; i < it; i++) {
      state.updateState(() => {
        state.currentStep = i.toString();
        sum += i;
        state.data['sum'] = sum;
      });

      await state.promiseWithAbort(waitForMs(10));
    }
  };

  test('workflow_can_finish', async () => {
    const workflow = createWorkflow(exec);

    workflow.onChange = () => {
      console.log(workflow.currentStep);
    };
    await workflow.start();
  });

  test('workflow_can_abort', async () => {
    const workflow = createWorkflow(exec);

    workflow.onChange = () => {
      if (workflow.currentStep === '1') return workflow.abort();
      console.log(workflow.currentStep);
    };
    const p = workflow.start();
    await expect(p).rejects.toThrowErrorMatchingSnapshot();
  });
});
