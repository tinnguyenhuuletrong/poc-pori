import { random } from 'lodash';

const ALL_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function randAdventureSlot(
  samples: number,
  excludeIndex: number[] = []
) {
  let pool = ALL_SLOTS.filter((itm) => !excludeIndex.includes(itm));

  const res = [];
  for (let i = 0; i < samples; i++) {
    const next = pool[random(0, pool.length - 1, false)];
    if (!next) throw new Error('not enough pool');

    pool = pool.filter((v) => v !== next);
    res.push(next);
  }

  return res;
}
