import ld from 'lodash';
import { AdventureInfoEx, Context, ENV } from '@pori-and-friends/pori-metadata';

import { sbattleSlotPick } from '../src/lib/auto/sbattleSlotPick';
import { init } from '../src/lib/startStop';
import { SCSCellInfo } from '../src/lib/adventure';

type ContextEx = Context & {
  _logs?: string[];
};

describe('s_battle_slot_pick', () => {
  let ctx: ContextEx;
  const BASE_MINE_INFO: AdventureInfoEx = {
    mineId: 36430,

    isFarmer: true,
    farmerAddress: '0xBFFB3aC9305C9426b456e3a5C9dB45bee0bFF3aC',

    isSupporter: false,
    supporterAddress: '0xBFFB3aC9305C9426b456e3a5C9dB45bee0bFF3aC',

    hasBigReward: true,

    farmerPories: [225, 3830, 3560, 2257],
    farmerRewardLevel: [3, 1, 2, 3],
    farmerSlots: [3, 1, 7, 9],

    supporterPories: [5748, 5567, 5749],
    supporterRewardLevel: [2, 2, 1],
    supporterSlots: [2, 4, 8],
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

  test('assit has 3p - not s', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 2, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 1],
      supporterSlots: [2, 4, 1],

      powers: {
        '225': 311,
        '2257': 318,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 314,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: [],
      helper: [],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test('assit has 3p - has s. explorer power higher', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 4],
      supporterSlots: [2, 4, 1],

      powers: {
        '225': 311,
        '2257': 318,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 300,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test('assit has 3p - has s. farmer 1 supporter 0', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 1],
      supporterSlots: [2, 4, 1],

      powers: {
        '225': 311,
        '2257': 318,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 300,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830'],
      helper: [],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test('assit has 3p - has s. farmer 1 supporter 1(higher)', async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 4],
      supporterSlots: [2, 4, 9],

      powers: {
        '225': 311,
        '2257': 318,
        '3560': 330,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 320,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test(`assit has 3p - has s. farmer 1 supporter 1(higher) - need swap 2 to win `, async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749],
      supporterRewardLevel: [2, 2, 4],
      supporterSlots: [2, 4, 9],

      powers: {
        '225': 311,
        '2257': 318,
        '3560': 310,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 320,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test(`assit has 3p - mine power lower. but can swap 2`, async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [100508, 5387, 6060, 6266],
      farmerRewardLevel: [2, 2, 4, 1],
      farmerSlots: [3, 8, 5, 9],

      supporterPories: [100766, 5131, 5425],
      supporterRewardLevel: [4, 3, 3],
      supporterSlots: [5, 7, 2],

      powers: {
        '5131': 314,
        '5387': 298,
        '5425': 311,
        '6060': 302,
        '6266': 305,
        '100508': 304,
        '100766': 322,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['5387'],
      helper: ['100766'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test(`assit has 4p - has s. farmer can win. p1 in s, p2 not`, async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749, 5421],
      supporterRewardLevel: [2, 2, 4, 1],
      supporterSlots: [2, 4, 9, 1],

      powers: {
        '225': 311,
        '2257': 318,
        '3560': 310,
        '3830': 312,
        '5567': 303,
        '5748': 308,
        '5749': 300,
        '5421': 200,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test(`assit has 4p - has s. farmer can win. p1 p2 not s`, async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 1, 1],
      farmerSlots: [3, 9, 7],

      supporterPories: [5748, 5567, 5749, 5421],
      supporterRewardLevel: [2, 2, 4, 1],
      supporterSlots: [2, 4, 9, 1],

      powers: {
        '225': 311,
        '2257': 318,
        '3560': 310,
        '3830': 280,
        '5567': 303,
        '5748': 308,
        '5749': 300,
        '5421': 200,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test(`assit has 4p - has s. farmer can win. p1 p2 not s 2`, async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 4, 1],
      farmerSlots: [3, 9, 9],

      supporterPories: [5748, 5567, 5749, 5421],
      supporterRewardLevel: [2, 2, 4, 1],
      supporterSlots: [2, 4, 9, 1],

      powers: {
        '225': 311,
        '2257': 318,
        '3560': 270,
        '3830': 280,
        '5567': 303,
        '5748': 308,
        '5749': 300,
        '5421': 200,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830', '3560'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });

  test(`assit has 4p - has s. farmer can not win`, async () => {
    const mineInfo: AdventureInfoEx = {
      ...BASE_MINE_INFO,

      farmerPories: [225, 3830, 3560, 2257],
      farmerRewardLevel: [3, 4, 4, 1],
      farmerSlots: [3, 9, 9],

      supporterPories: [5748, 5567, 5749, 5421],
      supporterRewardLevel: [2, 2, 4, 1],
      supporterSlots: [2, 4, 9, 1],

      powers: {
        '225': 211,
        '2257': 218,
        '3560': 270,
        '3830': 280,
        '5567': 303,
        '5748': 308,
        '5749': 300,
        '5421': 200,
      },
    };

    const sCellInfo: SCSCellInfo = {
      farmer: ['3830', '3560'],
      helper: ['5749'],
    };

    const sCmd = await sbattleSlotPick({
      mineInfo,
      sCellInfo,
      isFarmer: true,
      ctx,
    });
    console.log(sCmd);

    expect({ sCmd, logs: ctx._logs }).toMatchSnapshot();
  });
});
