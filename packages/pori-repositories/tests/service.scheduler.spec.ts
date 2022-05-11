import { waitForMs } from '@pori-and-friends/utils';
import Realm from 'realm';
import { openRepo, Services } from '../src';
import {
  ScheduleJobModel,
  SchedulerRepo,
  SchedulerService,
} from '../src/lib/services/scheduler';

describe('schedulerService', () => {
  let realm: Realm;
  let schedulerService: SchedulerService;

  beforeAll(async () => {
    realm = await openRepo({
      path: './_tests/testRepo',
      inMemory: true,
    });
    schedulerService = new SchedulerService();
  });

  afterEach(async () => {
    realm.write(() => {
      realm.deleteAll();
    });
    await schedulerService.stop(realm);
  });

  afterAll(() => {
    realm.close();
  });

  test('can schedule a job', async () => {
    await schedulerService.start(realm);

    const testFunc = jest.fn();

    schedulerService.addHandler('echo', async (job) => {
      testFunc(job.params);
    });

    await schedulerService.scheduleJob(
      realm,
      ScheduleJobModel.generate('echo', 'ttin', new Date(Date.now() + 100))
    );

    await waitForMs(500);
    expect(testFunc).toBeCalled();
  });

  test('can schedule and delete job', async () => {
    await schedulerService.start(realm);

    const testFunc = jest.fn();

    schedulerService.addHandler('echo', async (job) => {
      testFunc(job.params);
    });

    const jobId = await schedulerService.scheduleJob(
      realm,
      ScheduleJobModel.generate('echo', 'ttin', new Date(Date.now() + 100))
    );

    await schedulerService.deleteJob(realm, jobId);

    await waitForMs(500);
    expect(testFunc).not.toBeCalled();
  });

  test('can restore job', async () => {
    // mock 2 jobs
    SchedulerRepo.tx(realm, () => {
      SchedulerRepo.create(
        realm,
        ScheduleJobModel.generate('echo', 'ttin', new Date(Date.now() + 100))
      );

      SchedulerRepo.create(
        realm,
        ScheduleJobModel.generate('echo', 'ttin 1', new Date(Date.now() + 110))
      );
    });

    await schedulerService.start(realm);

    const testFunc = jest.fn();

    schedulerService.addHandler('echo', async (job) => {
      testFunc(job.params);
    });

    await waitForMs(500);
    expect(testFunc).toBeCalledTimes(2);
  });
});
