import Realm, { ConfigurationWithoutSync } from 'realm';
import { Schemas as IdleGameSchemas } from './lib/idleGames/schema';
import {
  IdleGameSCMetadataRepo,
  IdleGameSCMetadataDataModel,
  IdleGameSCEventRepo,
  IdleGameSCEventDataModel,
  PlayerRepo,
  PlayerDataModel,
  PoriRepo,
  PoriDataModel,
  DataViewModel,
  DataViewRepo,
} from './lib/idleGames/schema';
import {
  ScheduleJobModel,
  SchedulerServiceSchema,
  SchedulerRepo,
  SchedulerService,
} from './lib/services/scheduler';

export async function openRepo(opt: ConfigurationWithoutSync) {
  const schemas = opt.schema ?? [];
  const ins = await Realm.open({
    ...opt,
    schemaVersion: 3,
    schema: [...schemas, ...IdleGameSchemas, ...SchedulerServiceSchema],
    shouldCompactOnLaunch: () => true,
  });
  return ins;
}

const Services = {
  SchedulerService,
};

export {
  IdleGameSCMetadataDataModel,
  IdleGameSCEventDataModel,
  IdleGameSCMetadataRepo,
  IdleGameSCEventRepo,
  PlayerRepo,
  PlayerDataModel,
  PoriRepo,
  PoriDataModel,
  DataViewModel,
  DataViewRepo,
  ScheduleJobModel,
  SchedulerRepo,
  SchedulerService,
  Services,
};
