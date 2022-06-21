import Web3 from 'web3';
import type { Account } from 'web3-core';
import type { Contract } from 'web3-eth-contract';
import type WalletConnect from '@walletconnect/client';
import type { WebsocketProvider, HttpProvider } from 'web3-core';
import { EventEmitter } from 'stream';
import { MongoClient } from 'mongodb';

export enum ENV {
  Staging = 'STAG',
  Prod = 'PROD',
  ProdPorichain = 'PROD_PORICHAIN',
}
export type SendMessageHandler = (msg: string) => Promise<any>;
export type EditMessageHandler = (
  lastMsginfo: any,
  msg: string
) => Promise<any>;
export type CustomEstGasprice = (ctx: Context) => Promise<string>;

export type Context = {
  contract: Contract;
  web3: Web3;
  walletAcc?: Account;
  provider: WebsocketProvider | HttpProvider;
  walletConnectChannel?: WalletConnect;
  env: ENV;
  emiter?: EventEmitter;
  mongoClient?: MongoClient;
  playerAddress?: string;

  ui: {
    writeMessage: SendMessageHandler;
    editMessage: EditMessageHandler;
  };
  setting: {
    gasFactor: number;
    safeGweith: number;
    autoPlayMicroDelayMs: number;
  };
  custom: {
    estimageGas?: CustomEstGasprice;
  };
};

export type DnaBodyPartInfo = {
  d_head_class: number;
  d_head_type: number;
  r1_head_class: number;
  r1_head_type: number;
  r2_head_class: number;
  r2_head_type: number;
  r3_head_class: number;
  r3_head_type: number;
  d_face_class: number;
  d_face_type: number;
  r1_face_class: number;
  r1_face_type: number;
  r2_face_class: number;
  r2_face_type: number;
  r3_face_class: number;
  r3_face_type: number;
  d_body_class: number;
  d_body_type: number;
  r1_body_class: number;
  r1_body_type: number;
  r2_body_class: number;
  r2_body_type: number;
  r3_body_class: number;
  r3_body_type: number;
  d_arm_class: number;
  d_arm_type: number;
  r1_arm_class: number;
  r1_arm_type: number;
  r2_arm_class: number;
  r2_arm_type: number;
  r3_arm_class: number;
  r3_arm_type: number;
  d_accessory_class: number;
  d_accessory_type: number;
  r1_accessory_class: number;
  r1_accessory_type: number;
  r2_accessory_class: number;
  r2_accessory_type: number;
  r3_accessory_class: number;
  r3_accessory_type: number;
  d_leg_class: number;
  d_leg_type: number;
  r1_leg_class: number;
  r1_leg_type: number;
  r2_leg_class: number;
  r2_leg_type: number;
  r3_leg_class: number;
  r3_leg_type: number;
  d_tail_class: number;
  d_tail_type: number;
  r1_tail_class: number;
  r1_tail_type: number;
  r2_tail_class: number;
  r2_tail_type: number;
  r3_tail_class: number;
  r3_tail_type: number;
  legendary: number;
  reserved: number;
  l_head: number;
  l_face: number;
  l_body: number;
  l_arm: number;
  l_accessory: number;
  l_leg: number;
  l_tail: number;
  species_type: number;
  species_class: string;
  d_head_type_name: string;
  d_face_type_name: string;
  d_body_type_name: string;
  d_arm_type_name: string;
  d_accessory_type_name: string;
  d_leg_type_name: string;
  d_tail_type_name: string;
  r1_head_type_name: string;
  r1_face_type_name: string;
  r1_body_type_name: string;
  r1_arm_type_name: string;
  r1_accessory_type_name: string;
  r1_leg_type_name: string;
  r1_tail_type_name: string;
  r2_head_type_name: string;
  r2_face_type_name: string;
  r2_body_type_name: string;
  r2_arm_type_name: string;
  r2_accessory_type_name: string;
  r2_leg_type_name: string;
  r2_tail_type_name: string;
  r3_head_type_name: string;
  r3_face_type_name: string;
  r3_body_type_name: string;
  r3_arm_type_name: string;
  r3_accessory_type_name: string;
  r3_leg_type_name: string;
  r3_tail_type_name: string;
  purity: number;
};

export type NftInfo = {
  tokenId: number;
  type: number;
  name: string;
  dna: string;
  status: number;
  poriClass: number;
  numOfBreeds: number;
  maxOfBreeds: number;
  legend: number;
  purity: number;
  birthDate: string;
  ownerAddress: string;
  stage: number;
  health: number;
  speed: number;
  physicalAttack: number;
  physicalDefend: number;
  critical: number;
  magicAttack: number;
  magicDefend: number;
  minePower: number;
  helpPower: number;
  autoRenew: boolean;
  chapter1ExpiredAt: number | null;
  createdAt: string;
  updatedAt: string;
  ownerInfo: {
    ownerId: string;
    fullName: string;
    publicAddress: string;
  };
};

export type AdventureInfo = {
  mineId: number;

  state?: string;

  isFarmer: boolean;
  farmerAddress?: string;
  startTime?: Date;
  farmerEndTime: Date;

  isSupporter?: boolean;
  supporterAddress?: string;
  supporterEndTime?: Date;
  winnerAddress?: string;

  farmerPories?: number[];
  farmerRewardLevel?: number[];
  farmerSlots?: number[];

  supporterPories?: number[];
  supporterRewardLevel?: number[];
  supporterSlots?: number[];
};

export type AdventureStatsGroupByDay = {
  unixDay: number;
  timestamp: Date;
  finishedMineIds: number[];
  totalRigy: number;
  totalRiken: number;
};

export type AdventureInfoEx = Omit<
  AdventureInfo,
  'startTime' | 'farmerEndTime' | 'supporterEndTime'
> & {
  link: string;
  canCollect?: boolean;
  hasBigReward: boolean;
  startTime?: string;
  farmerEndTime?: string;
  supporterEndTime?: string;
  farmerAtkTime?: string;
  supporterAtkTime?: string;
  blockedTo: Date;
  atkAt: Date;
  powers: Record<string, number>;
};

export type PromiseReturnType<T> = T extends Promise<infer Return> ? Return : T;
