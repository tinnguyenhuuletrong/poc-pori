import debug from 'debug';

export const BOT_TIMEOUT_HOURS = 48;
export const BOT_FORMATIONS = [
  {
    minePories: ['3923', '3018', '182'],
    supportPori: '',
    usePortal: true,
  },
];

export const playerAddress = process.env.PLAYER_ADDRESS;
export const loggerInfo = debug('pori:info');

export const noHistoryMode = !!process.env.NO_HISTORY;
loggerInfo.enabled = true;
