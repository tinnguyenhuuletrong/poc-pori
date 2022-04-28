import Realm from 'realm';

export function CommonReamRepo<T extends Realm.Object>(MODEL_NAME: string) {
  return class Wrapper {
    public static async findOne(realm: Realm, id: any): Promise<T | undefined> {
      const res = realm.objectForPrimaryKey<T>(MODEL_NAME, id);
      return res;
    }

    public static async findAll(realm: Realm) {
      return realm.objects<T>(MODEL_NAME);
    }

    public static create(realm: Realm, data: Partial<T>): T {
      return realm.create<T>(
        MODEL_NAME,
        { ...data },
        Realm.UpdateMode.Modified
      );
    }

    static getOrCreate(realm: Realm, id: any, defaultData: Partial<T>): T {
      const res = realm.objectForPrimaryKey<T>(MODEL_NAME, id);
      if (res) {
        return res;
      }
      return Wrapper.create(realm, { ...defaultData, _id: id });
    }

    public static async createWithTx(
      realm: Realm,
      data: Partial<T>
    ): Promise<T> {
      return new Promise((resolve, reject) => {
        try {
          realm.write(() => {
            const res = realm.create<T>(
              MODEL_NAME,
              { ...data },
              Realm.UpdateMode.Modified
            );
            resolve(res as unknown as T);
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    static async upsertWithTx(
      realm: Realm,
      id: any,
      val: Partial<T>
    ): Promise<T> {
      return new Promise((resolve, reject) => {
        try {
          const res = realm.objectForPrimaryKey<T>(MODEL_NAME, id);
          if (res) {
            const mergedData = { ...res.toJSON(), ...val };
            return Wrapper.createWithTx(realm, mergedData)
              .then(resolve)
              .catch(reject);
          }

          return Wrapper.createWithTx(realm, { ...val, _id: id })
            .then(resolve)
            .catch(reject);
        } catch (error) {
          return reject(error);
        }
      });
    }

    static async getOrCreateWithTx(
      realm: Realm,
      id: any,
      defaultData: Partial<T>
    ): Promise<T> {
      return new Promise((resolve, reject) => {
        try {
          const res = realm.objectForPrimaryKey<T>(MODEL_NAME, id);
          if (res) {
            return resolve(res);
          }

          return Wrapper.createWithTx(realm, { ...defaultData, _id: id })
            .then(resolve)
            .catch(reject);
        } catch (error) {
          return reject(error);
        }
      });
    }

    static async tx(realm: Realm, handler: () => void): Promise<void> {
      return new Promise((resolve, reject) => {
        realm.write(() => {
          try {
            handler();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  };
}
