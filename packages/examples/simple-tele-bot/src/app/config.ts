import { ENV } from '@pori-and-friends/pori-metadata';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as AppEnv from '../environments/environment';
import * as AppEnvProd from '../environments/environment.prod';
import * as AppEnvProdPorichain from '../environments/environment.prod.porichain';

export const VERSION = '11';
export const env = ENV.ProdPorichain;
export const activeEnv = computeActiveEnv(env);
export const playerAddress = process.env.PLAYER_ADDRESS;
export const botMasterUid = process.env.TELEGRAM_MASTER_ID;

export const schedulerNewMineId = () => 'schedule_new_mine';
export const schedulerNewMineType = 'submit_new_mine_action';

export const schedulerNotifyMineFinishId = (mineId) =>
  `schedule_mine_finish_${mineId}`;

export const schedulerNotifyMineNotifyIdType =
  'schedule_mine_finish_notify_action';

export const schedulerNotifyMineAtkId = (mineId) =>
  `schedule_mine_atk_${mineId}`;

const formationConfig = readAsset(join(__dirname, './assets/formation.json'));
type AssetFormations = {
  minePories: string[];
  supportPori: string;
  usePortal: boolean;
};
type AssetSettings = {
  botTimeoutHours: number;
  maxPoriEngagedMission: number;
};

export const RuntimeConfig = {
  formations: formationConfig.formations as AssetFormations[],
  settings: formationConfig.settings as AssetSettings,
};

function computeActiveEnv(env: ENV) {
  let activeEnv: typeof AppEnv;
  switch (env) {
    case ENV.Prod:
      activeEnv = AppEnvProd;
      break;
    case ENV.ProdPorichain:
      activeEnv = AppEnvProdPorichain;
      break;
    case ENV.Staging:
      activeEnv = AppEnv;
      break;
  }
  return activeEnv;
}

function readAsset(path) {
  const config = readFileSync(path).toString();
  return JSON.parse(config);
}
