import * as Repos from '@pori-and-friends/pori-repositories';
import { computePlayerAdventure } from '../src/lib/dataView/playerAdventure';

describe('data_view', () => {
  let realm: Realm;

  beforeAll(async () => {
    realm = await Repos.openRepo({
      path: './_tests/testRepo.realm',
      inMemory: true,
    });
  });

  afterEach(() => {
    realm.write(() => {
      realm.deleteAll();
    });
  });

  afterAll(() => {
    realm.close();
  });

  test('active_adv_dataset_1', async () => {
    // Start -> Supported1 -> Supported2 -> Finish
    const Data = await import('./_mocks/active_adv_data_1');
    Repos.IdleGameSCEventRepo.tx(realm, () => {
      for (const it of Data.EVENTS) {
        Repos.IdleGameSCEventRepo.create(realm, it as any);
      }
    });

    const res = await computePlayerAdventure({
      playerAddress: '0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA',
      realm,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });

    expect({
      res,
    }).toMatchSnapshot();
  });

  test('active_adv_dataset_2', async () => {
    // Start -> Supported1 -> Supported2
    const Data = await import('./_mocks/active_adv_data_2');
    Repos.IdleGameSCEventRepo.tx(realm, () => {
      for (const it of Data.EVENTS) {
        Repos.IdleGameSCEventRepo.create(realm, it as any);
      }
    });

    const res = await computePlayerAdventure({
      playerAddress: '0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA',
      realm,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });

    expect({
      res,
    }).toMatchSnapshot();
  });

  test('active_adv_dataset_3', async () => {
    // Not related
    const Data = await import('./_mocks/active_adv_data_3');
    Repos.IdleGameSCEventRepo.tx(realm, () => {
      for (const it of Data.EVENTS) {
        Repos.IdleGameSCEventRepo.create(realm, it as any);
      }
    });

    const res = await computePlayerAdventure({
      playerAddress: '0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA',
      realm,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });

    expect({
      res,
    }).toMatchSnapshot();
  });

  test('active_adv_dataset_4', async () => {
    // Not related
    const Data = await import('./_mocks/active_adv_data_4');
    Repos.IdleGameSCEventRepo.tx(realm, () => {
      for (const it of Data.EVENTS) {
        Repos.IdleGameSCEventRepo.create(realm, it as any);
      }
    });

    const res = await computePlayerAdventure({
      playerAddress: '0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA',
      realm,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });

    expect({
      res,
    }).toMatchSnapshot();
  });

  test('active_adv_debug', async () => {
    // Not related
    const Data = await import('./_mocks/active_adv_data_debug');
    Repos.IdleGameSCEventRepo.tx(realm, () => {
      for (const it of Data.EVENTS) {
        Repos.IdleGameSCEventRepo.create(realm, it as any);
      }
    });

    const res = await computePlayerAdventure({
      playerAddress: '0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA',
      realm,
      realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });

    expect({
      res,
    }).toMatchSnapshot();
  });
});
