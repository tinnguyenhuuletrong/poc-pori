/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import Realm from 'realm';
import { CommonReamRepo } from '../common/baseDataModel';
import { NftInfo } from '@pori-and-friends/pori-metadata';

// -------------------------------------------------
//  Players
// -------------------------------------------------
export class PlayerDataModel extends Realm.Object {
  constructor(
    public readonly _id: string,
    public createdBlock: number,
    public pories: Realm.List<PoriDataModel>
  ) {
    super();
  }
  public static readonly NAME = 'Players';

  static generate(_id: string, createdBlock: number) {
    return {
      _id,
      createdBlock,
    };
  }

  static schema = {
    name: PlayerDataModel.NAME,
    primaryKey: '_id',
    properties: {
      _id: 'string',
      createdBlock: 'int',
      pories: 'Pories[]',
    },
  };
}
export const PlayerRepo = CommonReamRepo<PlayerDataModel>(PlayerDataModel.NAME);

// -------------------------------------------------
//  Pori
// -------------------------------------------------
export class PoriDataModel extends Realm.Object {
  constructor(
    public _id: number,

    // deposit to IdleGame
    public isActive: boolean,

    // nftInfo
    public type: number,
    public name: string,
    public dna: string,
    public status: number,
    public poriClass: number,
    public legend: number,
    public purity: number,
    public birthDate: string,
    public ownerAddress: string,
    public stage: number,
    public health: number,
    public speed: number,
    public physicalAttack: number,
    public physicalDefend: number,
    public critical: number,
    public magicAttack: number,
    public magicDefend: number,
    public minePower: number,
    public helpPower: number,
    public createdAt: string,
    public updatedAt: string,

    // link
    public player: PlayerDataModel
  ) {
    super();
  }
  public static readonly NAME = 'Pories';

  static generate(info: NftInfo) {
    const {
      tokenId,
      type,
      name,
      dna,
      status,
      poriClass,
      legend,
      purity,
      birthDate,
      ownerAddress,
      stage,
      health,
      speed,
      physicalAttack,
      physicalDefend,
      critical,
      magicAttack,
      magicDefend,
      minePower,
      helpPower,
      createdAt,
      updatedAt,
    } = info;
    return {
      _id: tokenId,
      isActive: true,

      // nftInfo
      type,
      name,
      dna,
      status,
      poriClass,
      legend,
      purity,
      birthDate,
      ownerAddress,
      stage,
      health,
      speed,
      physicalAttack,
      physicalDefend,
      critical,
      magicAttack,
      magicDefend,
      minePower,
      helpPower,
      createdAt,
      updatedAt,
    };
  }

  static schema = {
    name: PoriDataModel.NAME,
    primaryKey: '_id',
    properties: {
      _id: 'int',
      isActive: 'bool',

      // nftInfo
      type: 'int?',
      name: 'string?',
      dna: 'string?',
      status: 'int?',
      poriClass: 'int?',
      legend: 'int?',
      purity: 'int?',
      birthDate: 'string?',
      ownerAddress: 'string?',
      stage: 'int?',
      health: 'int?',
      speed: 'int?',
      physicalAttack: 'int?',
      physicalDefend: 'int?',
      critical: 'int?',
      magicAttack: 'int?',
      magicDefend: 'int?',
      minePower: 'int?',
      helpPower: 'int?',
      createdAt: 'string?',
      updatedAt: 'string?',
      player: {
        type: 'linkingObjects',
        objectType: PlayerDataModel.NAME,
        property: 'pories',
      },
    },
  };
}
export const PoriRepo = CommonReamRepo<PoriDataModel>(PoriDataModel.NAME);
