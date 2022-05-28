import debug from 'debug';
import Realm from 'realm';
import { CommonReamRepo } from '../common/baseDataModel';

const { ObjectID } = Realm.BSON;
const debugLog = debug('pori:services:scheduler');

// -------------------------------------------------
//  Scheduler
// -------------------------------------------------
export class ScheduleJobModel extends Realm.Object {
  _id = '';
  type = '';
  codeName = '';
  params = '';
  runAt: Date = new Date();
  hasFinish = false;
  result = '';

  public static readonly NAME = 'Schedulers';

  static generate(
    codeName: string,
    params: string,
    runAt: Date,
    _id: string = new ObjectID().toHexString()
  ) {
    return {
      _id,
      type: 'SCHEDULE',
      codeName,
      params,
      runAt,
      hasFinish: false,
    };
  }

  static schema = {
    name: ScheduleJobModel.NAME,
    primaryKey: '_id',
    properties: {
      _id: 'string',
      hasFinish: 'bool',
      type: 'string',
      codeName: 'string',
      params: 'string?',
      runAt: 'date?',
      result: 'string?',
    },
  };
}

export const SchedulerRepo = CommonReamRepo<ScheduleJobModel>(
  ScheduleJobModel.NAME
);

export const SchedulerServiceSchema = [ScheduleJobModel];

export type JobHandlerFunc = (arg: ScheduleJobModel) => Promise<any>;

export class SchedulerService {
  private jobHandlers: Record<string, JobHandlerFunc> = {};
  private timerTickets: Record<string, NodeJS.Timeout> = {};

  addHandler(name: string, func: JobHandlerFunc) {
    this.jobHandlers[name] = func;
  }

  async start(realm: Realm) {
    await this.refreshAllJob(realm);
  }
  async stop(realm: Realm) {
    for (const [k, v] of Object.entries(this.timerTickets)) {
      clearTimeout(v);
    }
  }

  async getJobById(realm: Realm, jobId: string) {
    const ins = await SchedulerRepo.findOne(realm, jobId);
    if (!ins) return;
    return ins;
  }

  async deleteJob(realm: Realm, jobId: string) {
    const ins = await SchedulerRepo.findOne(realm, jobId);
    if (!ins) return;

    SchedulerRepo.txSync(realm, () => {
      const ticketId = ins._id;
      delete this.timerTickets[ticketId];

      realm.delete(ins);
    });
  }

  async scheduleJob(
    realm: Realm,
    {
      codeName,
      params,
      runAt,
      _id,
    }: { codeName: string; params: string; runAt: Date; _id?: string }
  ) {
    const ins = await SchedulerRepo.createWithTx(
      realm,
      ScheduleJobModel.generate(codeName, params, runAt, _id)
    );
    await this.internalRegisterJob(realm, ins);
    return ins._id;
  }

  async refreshAllJob(realm: Realm) {
    const availableJobs = await this.listPendingJob(realm);
    for (const iterator of availableJobs) {
      await this.internalRegisterJob(
        realm,
        iterator as unknown as ScheduleJobModel
      );
    }
  }

  async listPendingJob(realm: Realm) {
    const now = new Date();
    const availableJobs = (await SchedulerRepo.findAll(realm)).filtered(
      `runAt >= $0 && hasFinish = false`,
      now
    );
    return availableJobs;
  }

  private async internalRegisterJob(realm: Realm, iterator: ScheduleJobModel) {
    const now = new Date();
    const { _id, runAt, codeName } = iterator;
    const ticketId = _id;
    if (this.timerTickets[ticketId]) {
      clearTimeout(this.timerTickets[ticketId]);
    }
    const intervalMs = runAt.valueOf() - now.valueOf();
    this.timerTickets[_id] = setTimeout(
      this.execJob(realm, ticketId),
      intervalMs
    );
  }

  private execJob(realm: Realm, jobId: string) {
    return async () => {
      debugLog(`[scheduler] job id run ${jobId}`);
      const ins = await SchedulerRepo.findOne(realm, jobId);
      if (!ins) return;
      const codeName = ins.codeName;
      const params = ins.params;
      debugLog(
        `[scheduler] job id run ${jobId}. codeName ${codeName}, params ${params}`
      );
      let result = '';
      try {
        const func = this.jobHandlers[codeName];
        if (!func) {
          result = `[error] missing handler for codeName ${codeName}`;
          debugLog(
            `[scheduler] job id run ${jobId}. missing handler for codeName ${codeName}`
          );
          return;
        }
        result = await func(ins);
      } catch (error: any) {
        result = `[error] ${error.message}`;
        console.error(
          `[scheduler] job id run ${jobId}. error ${error.message}`
        );
      } finally {
        delete this.timerTickets[jobId];
        SchedulerRepo.txSync(realm, () => {
          ins.hasFinish = true;
          ins.result = result;
        });
      }
    };
  }
}
