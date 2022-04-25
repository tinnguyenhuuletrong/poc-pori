export function toNumber(val: any) {
  return parseFloat(val);
}

export function transformArrayElementToNumber(val: any[]) {
  return val.map((itm) => toNumber(itm));
}
