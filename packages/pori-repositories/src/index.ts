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
} from './lib/idleGames/schema';

export async function openRepo(opt: ConfigurationWithoutSync) {
  const schemas = opt.schema ?? [];
  const ins = await Realm.open({
    ...opt,
    schemaVersion: 2,
    schema: [...schemas, ...IdleGameSchemas],
  });
  return ins;
}

export {
  IdleGameSCMetadataDataModel,
  IdleGameSCEventDataModel,
  IdleGameSCMetadataRepo,
  IdleGameSCEventRepo,
  PlayerRepo,
  PlayerDataModel,
  PoriRepo,
  PoriDataModel,
};
