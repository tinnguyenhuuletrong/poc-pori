// Idle Game Events

export enum EIdleGameSCEventType {
  AdventureFinished = 'AdventureFinished',
  AdventureFortified = 'AdventureFortified',
  AdventureStarted = 'AdventureStarted',
  AdventureSupported1 = 'AdventureSupported1',
  AdventureSupported2 = 'AdventureSupported2',
  PorianDeposited = 'PorianDeposited',
  PorianWithdrawed = 'PorianWithdrawed',
  GameDurationChanged = 'GameDurationChanged',
}

export interface AdventureStartedData {
  mineId: number;
  farmer: string;
  startTime: number;
  porians: number[];
  indexes: number[];
  rewardLevels: number[];
}

export interface AdventureFinishedData {
  mineId: number;
  winner: string;
  fragments: number;
  farmerReward1: number;
  farmerReward2: number;
  helperReward1: number;
  helperReward2: number;
}

export interface AdventureFortifiedData {
  mineId: number;
  porian: number;
  index: number;
  rewardLevel: number;
  blockedTime: number;
}

export interface AdventureSupported1Data {
  mineId: number;
  helper: string;
  porians: number[];
  indexes: number[];
  rewardLevels: number[];
  blockedTime: number;
}

export interface AdventureSupported2Data {
  mineId: number;
  porian: number;
  index: number;
  rewardLevel: number;
  blockedTime: number;
}

export interface PorianDepositedData {
  from: string;
  porian: number;
  expiredAt: number;
}

export interface PorianWithdrawedData {
  to: string;
  porian: number;
}

export interface GameDurationChangedData {
  adventureDuration: number;
  turnDuration: number;
}

export type AllIdleGameSCEventData =
  | AdventureStartedData
  | AdventureFinishedData
  | AdventureFortifiedData
  | AdventureSupported1Data
  | AdventureSupported2Data
  | PorianDepositedData
  | PorianWithdrawedData
  | GameDurationChangedData;

export interface IdleGameSCEvent {
  type: EIdleGameSCEventType;
  txHash: string;
  blockNo: number;
  data: AllIdleGameSCEventData;
}

export const IdleGameSCEventSignatureTable: Record<
  EIdleGameSCEventType,
  string
> = {
  [EIdleGameSCEventType.AdventureFinished]:
    '0xacba132576685783d626ee7ff7486ac6cf8580b51ca1ef49ee36edb6303ac735',
  [EIdleGameSCEventType.AdventureFortified]:
    '0x71b4d764a280d810a1907567eb53bcf7ebe267f0d94d40d2a5f20009e7b73569',
  [EIdleGameSCEventType.AdventureStarted]:
    '0xd498194e39f0d0d9426ee530bd16b2182b34d07d968365c8fdcaf73c5a6d0ac5',
  [EIdleGameSCEventType.AdventureSupported1]:
    '0xbe2e74f68284a904ef29e10f3e20b2c9bb540481fb9903c1aead3e26cc56f8b1',
  [EIdleGameSCEventType.AdventureSupported2]:
    '0x6dbf0858232497280bfdf35e37adf2002793779d07d4f48947b17509c71dd41c',
  [EIdleGameSCEventType.PorianDeposited]:
    '0xc42131d410ea79f1eafecd549df9a392681974b7f4d9f4d78c216ea12b6766e8',
  [EIdleGameSCEventType.PorianWithdrawed]:
    '0x44402a61584354899786311a4f0c7bf924b31db70b5ebef891d88cee08156ed5',
  [EIdleGameSCEventType.GameDurationChanged]:
    '0xc62be04bfb76e5e364578771d33bb80ebbea7219b67ba068fb4bbdaf83e4a3c0',
};

export const AllIdleGameEvents = Object.keys(IdleGameSCEventSignatureTable);
