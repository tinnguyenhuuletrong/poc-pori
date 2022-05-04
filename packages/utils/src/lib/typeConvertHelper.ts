import Realm from 'realm';

export function toNumber(val: any) {
  return parseFloat(val);
}

export function toDecimal128(val: any) {
  return Realm.BSON.Decimal128.fromString(val);
}

export function transformArrayElementToNumber(val: any[]) {
  return val.map((itm) => toNumber(itm));
}
