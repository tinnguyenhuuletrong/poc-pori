import debug from 'debug';

export const BOT_TIMEOUT_HOURS = 48;
export const BOT_FORMATIONS = [
  {
    minePories: ['1346', '5420', '5387'],
    supportPori: '1876',
    usePortal: true,
  },
];

export const playerAddress = process.env.PLAYER_ADDRESS;
export const loggerInfo = debug('pori:info');

export const noHistoryMode = !!process.env.NO_HISTORY;
loggerInfo.enabled = true;
