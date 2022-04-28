import { IdleGameSc } from '@pori-and-friends/pori-metadata';
import {
  openRepo,
  IdleGameSCEventDataModel,
  PlayerRepo,
  PoriRepo,
} from '@pori-and-friends/pori-repositories';
import { transformIdleGameEvent2Database } from '../src/lib/transformer/transformIdleGameEvent2Database';

describe('processEventToDb', () => {
  let realm: Realm;

  beforeAll(async () => {
    realm = await openRepo({
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

  test('dataset_1', async () => {
    const Data = await import('./_mocks/dataset_1');
    const res = await transformIdleGameEvent2Database(
      realm,
      Data.EVENTS,
      Data.resolveNftInfo
    );

    const players = (await PlayerRepo.findAll(realm)).toJSON();
    const pories = (await PoriRepo.findAll(realm)).toJSON();

    expect({
      players,
      pories,
    }).toMatchSnapshot();
  });
});
