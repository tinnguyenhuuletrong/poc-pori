import Realm from 'realm';
import { openRepo } from '../src';
import { CommonReamRepo } from '../src/lib/common/baseDataModel';

export class Task extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  description!: string;
  isComplete!: boolean;
  createdAt!: Date;
  userId!: string;

  constructor() {
    super();
  }

  static NAME = 'Task';
  static generate(description: string, userId?: string, isComplete?: boolean) {
    return {
      _id: new Realm.BSON.ObjectId(),
      description,
      isComplete,
      createdAt: new Date(),
      userId: userId || '_SYNC_DISABLED_',
    };
  }

  // To use a class as a Realm object type, define the object schema on the static property "schema".
  static schema = {
    name: Task.NAME,
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      description: 'string',
      isComplete: { type: 'bool', default: false },
      createdAt: 'date',
      userId: 'string',
    },
  };
}
const TaskRepo = CommonReamRepo<Task>(Task.NAME);

describe('realmRepo', () => {
  let realm: Realm;

  beforeAll(async () => {
    realm = await openRepo({
      path: './_tests/testRepo',
      inMemory: true,
      schema: [Task.schema],
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

  test('create', async () => {
    const ins = await TaskRepo.createWithTx(realm, Task.generate('hi', 'u1'));
    await TaskRepo.tx(realm, () => {
      ins.isComplete = true;
    });
    expect(ins.isComplete).toBe(true);
  });

  test('upsert', async () => {
    const id = new Realm.BSON.ObjectId('6268cb7613ef5fff5aa42c70');
    const ins = await TaskRepo.upsertWithTx(
      realm,
      id,
      Task.generate('hi', 'u1')
    );
    expect(ins._id).toEqual(id);

    await TaskRepo.upsertWithTx(realm, id, {
      isComplete: true,
    });
    expect(ins.isComplete).toBe(true);
  });

  test('query', async () => {
    await TaskRepo.tx(realm, () => {
      for (let index = 0; index < 10; index++) {
        TaskRepo.create(
          realm,
          Task.generate(`des ${index}`, `uid${index}`, index % 2 === 0)
        );
      }
    });

    const collections = await TaskRepo.findAll(realm);
    expect(collections.length).toEqual(10);
    expect(collections.filtered('isComplete == true').length).toEqual(5);
  });
});
