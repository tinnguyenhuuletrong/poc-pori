import {
  IdleGameSCMetadataDataModel,
  IdleGameSCEventDataModel,
} from './scInfo.schema';
import { PlayerDataModel, PoriDataModel } from './game.schema';

export * from './scInfo.schema';
export * from './game.schema';

export const Schemas = [
  IdleGameSCEventDataModel.schema,
  IdleGameSCMetadataDataModel.schema,
  IdleGameSCEventDataModel.embededEventDataSchema,
  PlayerDataModel.schema,
  PoriDataModel.schema,
];
