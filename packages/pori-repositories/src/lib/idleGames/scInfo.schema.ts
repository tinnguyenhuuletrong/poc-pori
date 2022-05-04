import {
  AllIdleGameSCEventData,
  EIdleGameSCEventType,
  IdleGameSCEvent,
} from '@pori-and-friends/pori-metadata';
import Realm from 'realm';
import { CommonReamRepo } from '../common/baseDataModel';
const { ObjectID } = Realm.BSON;

// -------------------------------------------------
//  SC.Events
// -------------------------------------------------

export class IdleGameSCEventDataModel
  extends Realm.Object
  implements IdleGameSCEvent
{
  constructor(
    public readonly _id: Realm.BSON.ObjectId = new ObjectID(),
    public type: EIdleGameSCEventType,
    public txHash: string,
    public blockNo: number,
    public data: AllIdleGameSCEventData
  ) {
    super();
  }

  public static generate({ type, txHash, blockNo, data }: IdleGameSCEvent) {
    return {
      _id: new ObjectID(),
      type,
      txHash,
      blockNo,
      data,
    };
  }

  public static readonly NAME = 'IdleGame.SCEvents';
  static schema = {
    name: IdleGameSCEventDataModel.NAME,
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      type: 'string',
      txHash: 'string',
      blockNo: 'int',
      data: 'IdleGame.SCEvents.EventPayload',
    },
  };

  static embededEventDataSchema = {
    name: 'IdleGame.SCEvents.EventPayload',
    embedded: true,
    properties: {
      mineId: 'int?',
      farmer: 'string?',
      startTime: 'int?',
      porians: {
        type: 'list',
        objectType: 'int',
        optional: true,
      },
      indexes: {
        type: 'list',
        objectType: 'int',
        optional: true,
      },
      winner: 'string?',
      fragments: 'int?',
      farmerReward1: 'decimal128?',
      farmerReward2: 'decimal128?',
      helperReward1: 'decimal128?',
      helperReward2: 'decimal128?',
      porian: 'int?',
      index: 'int?',
      rewardLevel: 'int?',
      blockedTime: 'int?',
      helper: 'string?',
      rewardLevels: {
        type: 'list',
        objectType: 'int',
        optional: true,
      },
      from: 'string?',
      expiredAt: 'int?',
      to: 'string?',
      adventureDuration: 'int?',
      turnDuration: 'int?',
    },
  };
}
export const IdleGameSCEventRepo = CommonReamRepo<IdleGameSCEventDataModel>(
  IdleGameSCEventDataModel.NAME
);
// -------------------------------------------------
//  SC.Metadata
// -------------------------------------------------

export class IdleGameSCMetadataDataModel extends Realm.Object {
  constructor(
    public readonly _id: string,
    public createdBlock: number,
    public updatedBlock: number,
    public extras: Record<string, any> = {}
  ) {
    super();
  }
  public static readonly NAME = 'IdleGame.Metadata';

  static schema = {
    name: IdleGameSCMetadataDataModel.NAME,
    primaryKey: '_id',
    properties: {
      _id: 'string',
      createdBlock: 'int',
      updatedBlock: 'int',
      extras: '{}',
    },
  };
}
export const IdleGameSCMetadataRepo =
  CommonReamRepo<IdleGameSCMetadataDataModel>(IdleGameSCMetadataDataModel.NAME);
