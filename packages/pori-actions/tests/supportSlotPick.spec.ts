import ld from 'lodash';
import { AdventureInfoEx, Context, ENV } from '@pori-and-friends/pori-metadata';

import { supportSlotPick } from '../src/lib/auto/supportSlotPick';
import { init } from '../src/lib/startStop';

type ContextEx = Context & {
  _logs?: string[];
};

describe('support_slot_pick', () => {
  let ctx: ContextEx;
  const BASE_MINE_INFO: AdventureInfoEx = {
    mineId: 36430,

    isFarmer: true,
    farmerAddress: '0xBFFB3aC9305C9426b456e3a5C9dB45bee0bFF3aC',

    isSupporter: false,
    supporterAddress: '0xBFFB3aC9305C9426b456e3a5C9dB45bee0bFF3aC',

    hasBigReward: true,

    farmerPories: [225, 3830, 3560, 2257],
    farmerRewardLevel: [3, 4, 1, 4],
    farmerSlots: [3, 9, 7, 9],

    supporterPories: [5748, 5567, 5749],
    supporterRewardLevel: [2, 2, 4],
    supporterSlots: [2, 4, 9],
    link: '',
    blockedTo: new Date('2022-07-06T04:56:45.000Z'),
    atkAt: new Date(' 2022-07-06T02:26:45.000Z'),
    powers: {
      '225': 311,
      '2257': 318,
      '3560': 312,
      '3830': 312,
      '5567': 303,
      '5748': 308,
      '5749': 314,
    },
  };

  beforeAll(async () => {
    ctx = await init(ENV.ProdPorichain);
    ctx._logs = [];
    ctx.ui.writeMessage = async (msg) => {
      console.log(msg);
      ctx._logs?.push(msg);
    };
  });

  beforeEach(() => {
    ctx._logs = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('protect s', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560],
      farmerRewardLevel: [3, 4, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 4],
      supporterSlots: [2, 4, 9],

      powers: {
        '225': 311,
        '2257': 318,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 314,
      },
    };

    const slotIndex = await supportSlotPick({
      mineInfo,
      isFarmer: true,
      pori: '99',
      ctx,
    });

    expect({ slotIndex, logs: ctx._logs }).toMatchSnapshot();
  });

  test('giveup s', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560],
      farmerRewardLevel: [3, 4, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 4],
      supporterSlots: [2, 4, 9],

      powers: {
        '225': 311,
        '2257': 318,
        '3830': 289,
        '5567': 303,
        '5748': 308,
        '5749': 314,
      },
    };

    jest.spyOn(ld, 'random').mockReturnValue(1);

    const slotIndex = await supportSlotPick({
      mineInfo,
      isFarmer: true,
      pori: '99',
      ctx,
    });

    expect({ slotIndex, logs: ctx._logs }).toMatchSnapshot();
  });

  test('no s', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560],
      farmerRewardLevel: [3, 3, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 3],
      supporterSlots: [2, 4, 5],

      powers: {
        '225': 311,
        '2257': 318,
        '3830': 289,
        '5567': 303,
        '5748': 308,
        '5749': 314,
      },
    };

    jest.spyOn(ld, 'random').mockReturnValue(1);
    const slotIndex = await supportSlotPick({
      mineInfo,
      isFarmer: true,
      pori: '99',
      ctx,
    });

    expect({ slotIndex, logs: ctx._logs }).toMatchSnapshot();
  });

  test('assit found s', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560],
      farmerRewardLevel: [3, 3, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 4],
      supporterSlots: [2, 4, 5],
      powers: {
        '225': 311,
        '2257': 318,
        '3830': 289,
        '5567': 303,
        '5748': 308,
        '5749': 314,
      },
    };

    jest.spyOn(ld, 'random').mockReturnValue(1);
    const slotIndex = await supportSlotPick({
      mineInfo,
      isFarmer: true,
      pori: '99',
      ctx,
    });

    expect({ slotIndex, logs: ctx._logs }).toMatchSnapshot();
  });
});
