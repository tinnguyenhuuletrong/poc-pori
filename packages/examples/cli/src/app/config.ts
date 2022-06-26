import debug from 'debug';
import { readFileSync } from 'fs';
import { join } from 'path';
import { inspect } from 'util';

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

export const playerAddress = process.env.PLAYER_ADDRESS;
export const loggerInfo = debug('pori:info');

export const noHistoryMode = !!process.env.NO_HISTORY;
loggerInfo.enabled = true;

console.log('Runtime setting', inspect(RuntimeConfig, false, 10));

function readAsset(path) {
  const config = readFileSync(path).toString();
  return JSON.parse(config);
}
