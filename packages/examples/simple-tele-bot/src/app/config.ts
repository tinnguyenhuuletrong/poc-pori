import { ENV } from '@pori-and-friends/pori-metadata';
import * as AppEnv from '../environments/environment';
import * as AppEnvProd from '../environments/environment.prod';

export const env = ENV.Prod;
export const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;
export const playerAddress = process.env.PLAYER_ADDRESS;
export const botMasterUid = process.env.TELEGRAM_MASTER_ID;
export const MINE_ATK_PRICE_FACTOR = 1.2;
export const FORMATION = ['1346', '5420', '1876'];

export const schedulerNewMineId = () => 'schedule_new_mine';
export const schedulerNewMineType = 'submit_new_mine_action';

export const schedulerNotifyMineFinishId = (mineId) =>
  `schedule_mine_finish_${mineId}`;
export const schedulerNotifyMineFinishIdType =
  'schedule_mine_finish_notify_action';
