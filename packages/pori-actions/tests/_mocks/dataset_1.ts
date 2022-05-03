import { IdleGameSc } from '@pori-and-friends/pori-metadata';
import { IdleGameSCEventDataModel } from '@pori-and-friends/pori-repositories';
import Realm from 'realm';
const { ObjectID } = Realm.BSON;

// User deposit 2 Poris

export const EVENTS = [
  new IdleGameSCEventDataModel(
    new ObjectID(),
    IdleGameSc.EIdleGameSCEventType.PorianDeposited,
    '0x123',
    1,
    {
      from: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
      porian: 1182,
      expiredAt: 123,
    } as IdleGameSc.PorianDepositedData
  ),

  new IdleGameSCEventDataModel(
    new ObjectID(),
    IdleGameSc.EIdleGameSCEventType.PorianDeposited,
    '0x123',
    1,
    {
      from: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
      porian: 1183,
      expiredAt: 123,
    } as IdleGameSc.PorianDepositedData
  ),

  new IdleGameSCEventDataModel(
    new ObjectID(),
    IdleGameSc.EIdleGameSCEventType.PorianWithdrawed,
    '0x123',
    1,
    {
      to: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
      porian: 1183,
    } as IdleGameSc.PorianWithdrawedData
  ),
];

const NFT_INFO_MAP: any = {
  1182: {
    tokenId: 1182,
    type: 2,
    name: 'Bruwan',
    dna: '9076431867127095074785173926980014995178110010806707409896581273537522696192',
    status: 5,
    poriClass: 1,
    numOfBreeds: 1,
    maxOfBreeds: 5,
    legend: 0,
    purity: 3,
    birthDate: '2022-04-20T11:28:00.000Z',
    ownerAddress: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
    stage: 2,
    health: 86,
    speed: 70,
    physicalAttack: 69,
    physicalDefend: 79,
    critical: 71,
    magicAttack: 69,
    magicDefend: 74,
    minePower: 310,
    helpPower: 294,
    autoRenew: false,
    chapter1ExpiredAt: 7955107200,
    createdAt: '2022-04-20T12:53:03.401Z',
    updatedAt: '2022-04-27T15:11:03.202Z',
    ownerInfo: {
      ownerId: 'fede6d70-15d3-4f9c-81d5-517038d378c8',
      fullName: 'Porian 8380993',
      publicAddress: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
    },
  },
  1183: {
    tokenId: 1183,
    type: 2,
    name: 'Bruwan',
    dna: '9076431867127095074785173926980014995178110010806707409896581273537522696192',
    status: 5,
    poriClass: 1,
    numOfBreeds: 1,
    maxOfBreeds: 5,
    legend: 0,
    purity: 3,
    birthDate: '2022-04-20T11:28:00.000Z',
    ownerAddress: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
    stage: 2,
    health: 86,
    speed: 70,
    physicalAttack: 69,
    physicalDefend: 79,
    critical: 71,
    magicAttack: 69,
    magicDefend: 74,
    minePower: 310,
    helpPower: 294,
    autoRenew: false,
    chapter1ExpiredAt: 7955107200,
    createdAt: '2022-04-20T12:53:03.401Z',
    updatedAt: '2022-04-27T15:11:03.202Z',
    ownerInfo: {
      ownerId: 'fede6d70-15d3-4f9c-81d5-517038d378c8',
      fullName: 'Porian 8380993',
      publicAddress: '0x3048aa7a4eb54bdc7f7b35d98603a18718380993',
    },
  },
};

export const resolveNftInfo = async (id: any) => {
  return NFT_INFO_MAP[id];
};
