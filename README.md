# Poc-01

## Requirement

- Node 14+

## Instalation

1. npm install
2. copy `.env.template` -> `.env`. Update value in <....>
3. export env to bash

``` sh
source ./.env
```

## run example

```sh
npx ts-node examples/<name>.ts

Example: queryMineInfo
mineInfo 19433 -> {
  state: '5',
  farmer: [
    '0x7B3f40dad614c48004B85FC5f7C08aCa633f7C58',
    '0x010203000000000000000000',
    '0',
    '0',
    player: '0x7B3f40dad614c48004B85FC5f7C08aCa633f7C58',
    selectedCells: '0x010203000000000000000000',
    porianId1: '0',
    porianId2: '0'
  ],
  helper: [
    '0x0000000000000000000000000000000000000000',
    '0x000000000000000000000000',
    '0',
    '0',
    player: '0x0000000000000000000000000000000000000000',
    selectedCells: '0x000000000000000000000000',
    porianId1: '0',
    porianId2: '0'
  ],
  rewardMap: '0x000002010301030100000000000000000000000000000000625c1e9b00000000'
}

Example: queryMineInfo
0xd7b7b64d3344ab06034af4a3871839e9
{
  blockNumber: 25973457,
  transactionHash: '0x148d8334f33546586517729f447131cee80b782663cc0ce201132c67d6421d75',
  event: 'AdventureSupported1',
  data: Result {
    '0': '19467',
    '1': '0xee1f56339a9A85D506036AC212fb58Ef6C6f32E6',
    '2': [ '13266', '13009', '6989' ],
    '3': [ '4', '5', '6' ],
    '4': [ '3', '1', '4' ],
    '5': '1650207879',
    mineId: '19467',
    helper: '0xee1f56339a9A85D506036AC212fb58Ef6C6f32E6',
    porians: [ '13266', '13009', '6989' ],
    indexes: [ '4', '5', '6' ],
    rewardLevels: [ '3', '1', '4' ],
    blockedTime: '1650207879'
  }
}
{
  blockNumber: 25973459,
  transactionHash: '0xf794dc30b429b96bb32a3cc6afd9a152973a28ce5766984dc6d5bd01f1f25303',
  event: 'AdventureStarted',
  data: Result {
    '0': '19468',
    '1': '0x7B3f40dad614c48004B85FC5f7C08aCa633f7C58',
    '2': '1650206419',
    '3': [ '11807', '12647', '12460' ],
    '4': [ '1', '2', '3' ],
    '5': [ '1', '3', '4' ],
    '6': '1650207919',
    mineId: '19468',
    farmer: '0x7B3f40dad614c48004B85FC5f7C08aCa633f7C58',
    startTime: '1650206419',
    porians: [ '11807', '12647', '12460' ],
    indexes: [ '1', '2', '3' ],
    rewardLevels: [ '1', '3', '4' ],
    blockedTime: '1650207919'
  }
}
{
  blockNumber: 25973459,
  transactionHash: '0xe1e02585d1a6c6917ec5580a7e3460286774bca73c25ed0795a1897412567bb6',
  event: 'AdventureStarted',
  data: Result {
    '0': '19469',
    '1': '0xb081CB4B325bd99e2324Fd00F32B15d003819105',
    '2': '1650206419',
    '3': [ '12911', '12965', '10247' ],
    '4': [ '1', '2', '3' ],
    '5': [ '1', '3', '4' ],
    '6': '1650207919',
    mineId: '19469',
    farmer: '0xb081CB4B325bd99e2324Fd00F32B15d003819105',
    startTime: '1650206419',
    porians: [ '12911', '12965', '10247' ],
    indexes: [ '1', '2', '3' ],
    rewardLevels: [ '1', '3', '4' ],
    blockedTime: '1650207919'
  }
}
```

## TODO List

- [x] Query poriant info from nft id -> calculate atk + def
- [-] Integrate telegaram bot -> notify us when
   - [ ] adventure complete 
   - [ ] got atk
- [ ] Allow import private key -> auto start adventure
- [ ] Smarter bot :)) - TBD