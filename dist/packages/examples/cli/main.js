/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./packages/examples/cli/src/app/config.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.noHistoryMode = exports.loggerInfo = exports.playerAddress = exports.RuntimeConfig = void 0;
const tslib_1 = __webpack_require__("tslib");
const debug_1 = tslib_1.__importDefault(__webpack_require__("debug"));
const fs_1 = __webpack_require__("fs");
const path_1 = __webpack_require__("path");
const util_1 = __webpack_require__("util");
const formationConfig = readAsset((0, path_1.join)(__dirname, './assets/formation.json'));
exports.RuntimeConfig = {
    formations: formationConfig.formations,
    settings: formationConfig.settings,
};
exports.playerAddress = process.env.PLAYER_ADDRESS;
exports.loggerInfo = (0, debug_1.default)('pori:info');
exports.noHistoryMode = !!process.env.NO_HISTORY;
exports.loggerInfo.enabled = true;
console.log('Runtime setting', (0, util_1.inspect)(exports.RuntimeConfig, false, 10));
function readAsset(path) {
    const config = (0, fs_1.readFileSync)(path).toString();
    return JSON.parse(config);
}


/***/ }),

/***/ "./packages/examples/cli/src/environments/environment.prod.porichain.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.environment = void 0;
const tslib_1 = __webpack_require__("tslib");
const path_1 = tslib_1.__importDefault(__webpack_require__("path"));
process.env.NODE_REPL_HISTORY = path_1.default.join(__dirname, '../../../../archived/repo/.history');
exports.environment = {
    dbPath: path_1.default.join(__dirname, '../../../../archived/repo/prodPoriChain/allEvents.prod.realm'),
    walletConnectSessionStoragePath: path_1.default.join(__dirname, '../../../../archived/repo/.web3session'),
    mongodbDataStoreUri: process.env.MONGODB_DATA_STORE_URI,
    mongodbDataStoreSSLCer: path_1.default.join(__dirname, '../../../../archived/repo/mongodb.pem'),
    aesKeyPath: path_1.default.join(__dirname, '../../../../archived/repo/.aesKey'),
    createdBlock: 7643,
    production: true,
};


/***/ }),

/***/ "./packages/examples/cli/src/environments/environment.prod.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.environment = void 0;
const tslib_1 = __webpack_require__("tslib");
const path_1 = tslib_1.__importDefault(__webpack_require__("path"));
process.env.NODE_REPL_HISTORY = path_1.default.join(__dirname, '../../../../archived/repo/.history');
exports.environment = {
    dbPath: path_1.default.join(__dirname, '../../../../archived/repo/prod/allEvents.prod.realm'),
    walletConnectSessionStoragePath: path_1.default.join(__dirname, '../../../../archived/repo/.web3session'),
    mongodbDataStoreUri: process.env.MONGODB_DATA_STORE_URI,
    mongodbDataStoreSSLCer: path_1.default.join(__dirname, '../../../../archived/repo/mongodb.pem'),
    aesKeyPath: path_1.default.join(__dirname, '../../../../archived/repo/.aesKey'),
    createdBlock: 27503296,
    production: true,
};


/***/ }),

/***/ "./packages/examples/cli/src/environments/environment.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.environment = void 0;
const tslib_1 = __webpack_require__("tslib");
const path_1 = tslib_1.__importDefault(__webpack_require__("path"));
exports.environment = {
    dbPath: path_1.default.join(__dirname, '../../../../archived/repo/stag/allEvents.stag.realm'),
    aesKeyPath: '',
    mongodbDataStoreUri: '',
    mongodbDataStoreSSLCer: '',
    walletConnectSessionStoragePath: '',
    createdBlock: 25777543,
    production: false,
};


/***/ }),

/***/ "./packages/mongodb-data-store/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./packages/mongodb-data-store/src/lib/mongodb-data-store.ts"), exports);


/***/ }),

/***/ "./packages/mongodb-data-store/src/lib/mongodb-data-store.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchBolb = exports.downloadBlob = exports.storeBlob = exports.addMongodbDataStore = exports.waitForConnected = void 0;
const tslib_1 = __webpack_require__("tslib");
const mongodb_1 = __webpack_require__("mongodb");
const debug_1 = tslib_1.__importDefault(__webpack_require__("debug"));
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const log = (0, debug_1.default)('pori:mongodb-data-store');
const connectDefer = new utils_1.Deferred();
async function waitForConnected(ctx) {
    // if (!ctx.mongoClient) throw new Error('ctx.mongoClient not found');
    await connectDefer.promise;
    return ctx.mongoClient;
}
exports.waitForConnected = waitForConnected;
async function addMongodbDataStore(ctx, uri, pathToCert) {
    const client = new mongodb_1.MongoClient(uri, {
        sslKey: pathToCert,
        sslCert: pathToCert,
        serverApi: mongodb_1.ServerApiVersion.v1,
    });
    connectDefer.reset();
    await client.connect();
    ctx.mongoClient = client;
    connectDefer.resolve(client);
    log('connected!');
    return client;
}
exports.addMongodbDataStore = addMongodbDataStore;
function getBucket(mongoClient) {
    const db = mongoClient.db('storage');
    const bucket = new mongodb_1.GridFSBucket(db, {
        chunkSizeBytes: 10 * 1024 * 1024, // 5mb
    });
    return bucket;
}
async function storeBlob(ctx, key, dataStream, metadata = {}) {
    if (!ctx.mongoClient)
        throw new Error('ctx.mongoClient not found');
    const bucket = getBucket(ctx.mongoClient);
    // TODO: check max revision to keep
    const oldFiles = await bucket.find({ filename: key }).toArray();
    for (const it of oldFiles) {
        await bucket.delete(it._id);
    }
    const writeStream = bucket.openUploadStream(key, {
        metadata,
    });
    dataStream.pipe(writeStream);
    return new Promise((resolve, _) => {
        writeStream.once('finish', () => {
            resolve();
        });
    });
}
exports.storeBlob = storeBlob;
async function downloadBlob(ctx, key) {
    if (!ctx.mongoClient)
        throw new Error('ctx.mongoClient not found');
    const bucket = getBucket(ctx.mongoClient);
    const fileMeta = (await bucket.find({ filename: key }, { sort: { uploadDate: -1 } }).toArray())[0];
    const readStream = bucket.openDownloadStreamByName(key);
    return [fileMeta, readStream];
}
exports.downloadBlob = downloadBlob;
async function fetchBolb(ctx, key) {
    if (!ctx.mongoClient)
        throw new Error('ctx.mongoClient not found');
    const bucket = getBucket(ctx.mongoClient);
    const fileMeta = (await bucket.find({ filename: key }, { sort: { uploadDate: -1 } }).toArray())[0];
    return fileMeta;
}
exports.fetchBolb = fetchBolb;


/***/ }),

/***/ "./packages/pori-actions/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Auto = exports.Cmds = exports.Computed = exports.WalletActions = exports.Workflow = exports.Adventure = exports.DataView = exports.Input = void 0;
const tslib_1 = __webpack_require__("tslib");
const Input = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/input/pullData.ts"));
exports.Input = Input;
const DataView = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/dataView/index.ts"));
exports.DataView = DataView;
const Adventure = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/adventure.ts"));
exports.Adventure = Adventure;
const Workflow = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/workflow/workflowV1.ts"));
exports.Workflow = Workflow;
const WalletActions = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/wallet/web3Action.ts"));
exports.WalletActions = WalletActions;
const MyAdventure = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/computed/myAdventure.ts"));
const Auto = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/auto/autoPlayWorkflow.ts"));
exports.Auto = Auto;
const Cmds = tslib_1.__importStar(__webpack_require__("./packages/pori-actions/src/lib/cmds/cmds.ts"));
exports.Cmds = Cmds;
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/basic.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/nftBodyPart.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/queryPoriApi.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/startStop.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/transformer/transformIdleGameEvent2Database.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/wallet/walletConnect.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/wallet/balance.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/exchange/kyberPool.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/exchange/binance.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/exchange/token2Usd.ts"), exports);
const Computed = {
    MyAdventure,
};
exports.Computed = Computed;


/***/ }),

/***/ "./packages/pori-actions/src/lib/adventure.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.queryPowers = exports.getPoriansAtSCellSc = exports.queryPortalInfoSc = exports.queryMissiontOfPoriSc = exports.queryRandomRewardLevelFromSc = exports.queryMineinfoFromSc = exports.randAdventureSlot = void 0;
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const pori_repositories_1 = __webpack_require__("./packages/pori-repositories/src/index.ts");
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const lodash_1 = __webpack_require__("lodash");
const ALL_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function randAdventureSlot(samples, excludeIndex = []) {
    let pool = ALL_SLOTS.filter((itm) => !excludeIndex.includes(itm));
    const res = [];
    for (let i = 0; i < samples; i++) {
        const next = pool[(0, lodash_1.random)(0, pool.length - 1, false)];
        if (!next)
            throw new Error('not enough pool');
        pool = pool.filter((v) => v !== next);
        res.push(next);
    }
    return res;
}
exports.randAdventureSlot = randAdventureSlot;
async function queryMineinfoFromSc(ctx, mineId) {
    const res = await ctx.contract.methods.mines(mineId - 1).call();
    const farmer = parseMinePlayer(ctx, res.farmer);
    const helper = parseMinePlayer(ctx, res.helper);
    const rewardMap = parseRewardMap(ctx, res.rewardMap);
    return {
        farmer,
        helper,
        rewardMap,
    };
}
exports.queryMineinfoFromSc = queryMineinfoFromSc;
function parseMinePlayer(ctx, playerInfo) {
    const address = playerInfo.player;
    const selectedIndex = ctx.web3.utils
        .hexToBytes(playerInfo.selectedCells)
        .filter((itm) => itm > 0);
    return {
        address,
        selectedIndex,
    };
}
function parseRewardMap(ctx, rawRewardMap) {
    const bytes = ctx.web3.utils.hexToBytes(rawRewardMap);
    const env = (0, utils_1.byte2number)(bytes.slice(0, 2));
    const startTimeUnixSec = (0, utils_1.byte2number)(bytes.slice(20, 28));
    const slots = {};
    const startOffset = 2;
    for (let i = 0; i < 9; i++) {
        const reward = bytes[startOffset + i * 2];
        const joined = bytes[startOffset + i * 2 + 1];
        slots[i] = { reward, joined };
    }
    return {
        env,
        startTimeUnixSec,
        startTimeInDate: new Date(startTimeUnixSec * 1000),
        slots,
        mineRawRewadMap: rawRewardMap,
    };
}
async function queryRandomRewardLevelFromSc(ctx, mineInfo) {
    return ctx.contract.methods
        .randomRewardLevel(mineInfo.rewardMap.mineRawRewadMap)
        .call();
}
exports.queryRandomRewardLevelFromSc = queryRandomRewardLevelFromSc;
async function queryMissiontOfPoriSc(ctx, pori) {
    const engagedMission = await ctx.contract.methods.missionOfPori(pori).call();
    return parseInt(engagedMission);
}
exports.queryMissiontOfPoriSc = queryMissiontOfPoriSc;
async function queryPortalInfoSc(ctx, addr) {
    const info = await ctx.contractPortal.methods.portalInfoOf(addr).call();
    const { missions, fastMissions, capacityMissions, suppliedRiken, availableRiken, lockedRiken, } = info;
    let nextMissionRequireRiken = parseInt(await ctx.contractPortal.methods.mission2Riken(+fastMissions + 1).call()) / pori_metadata_1.TEN_POWER_10;
    if (nextMissionRequireRiken <= 0)
        nextMissionRequireRiken = Number.MAX_SAFE_INTEGER;
    return {
        missions: parseInt(missions),
        fastMissions: parseInt(fastMissions),
        capacityMissions: parseInt(capacityMissions),
        suppliedRiken: parseInt(suppliedRiken) / pori_metadata_1.TEN_POWER_10,
        availableRiken: parseInt(availableRiken) / pori_metadata_1.TEN_POWER_10,
        lockedRiken: parseInt(lockedRiken) / pori_metadata_1.TEN_POWER_10,
        nextMissionRequireRiken: nextMissionRequireRiken,
    };
}
exports.queryPortalInfoSc = queryPortalInfoSc;
async function getPoriansAtSCellSc(ctx, missionId) {
    const [farmerSCellInfo, helperSCellInfo] = await Promise.all([
        ctx.contract.methods.getPoriansAtSCell(missionId, false).call(),
        ctx.contract.methods.getPoriansAtSCell(missionId, true).call(),
    ]);
    const farmer = [farmerSCellInfo['0'], farmerSCellInfo['1']]
        .filter((itm) => itm !== '0')
        .map((itm) => itm.toString());
    const helper = [helperSCellInfo['0'], helperSCellInfo['1']]
        .filter((itm) => itm !== '0')
        .map((itm) => itm.toString());
    return {
        farmer,
        helper,
    };
}
exports.getPoriansAtSCellSc = getPoriansAtSCellSc;
function queryPowers({ ctx, realm, farmerPories, supporterPories, }) {
    const powers = {};
    for (const id of farmerPories) {
        const info = pori_repositories_1.PoriRepo.findOneSync(realm, id);
        if (info)
            powers[id] = info.minePower;
    }
    for (const id of supporterPories) {
        const info = pori_repositories_1.PoriRepo.findOneSync(realm, id);
        if (info)
            powers[id] = info.helpPower;
    }
    return powers;
}
exports.queryPowers = queryPowers;


/***/ }),

/***/ "./packages/pori-actions/src/lib/auto/autoPlayWorkflow.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stopBot = exports.autoPlayV1 = exports.autoRefreshStatus = exports.AutoPlayDb = exports.ESB_P_THRESHOLD_KEEP_BIG_REWARD = void 0;
const tslib_1 = __webpack_require__("tslib");
const index_1 = __webpack_require__("./packages/pori-actions/src/index.ts");
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const moment_1 = tslib_1.__importDefault(__webpack_require__("moment"));
const adventure_1 = __webpack_require__("./packages/pori-actions/src/lib/adventure.ts");
const supportSlotPick_1 = __webpack_require__("./packages/pori-actions/src/lib/auto/supportSlotPick.ts");
exports.ESB_P_THRESHOLD_KEEP_BIG_REWARD = 15;
const MAX_PORI_ENGAGED_MISSION = 500;
const SBATTLE_BEFORE_END_MS = 30 * 60 * 1000; // 30 mins
exports.AutoPlayDb = {};
async function autoRefreshStatus({ ctx, realm, playerAddress, args, }) {
    const intervalMs = args.intervalMs;
    const botId = `auto_refresh`;
    if (exports.AutoPlayDb[botId]) {
        ctx.ui.writeMessage(`bot with id ${botId} is running. skip it`);
        return;
    }
    const workflowExec = async (state) => {
        let count = 0;
        state.updateState(() => {
            state.data['_it'] = count;
            state.data['_nextAt'] = new Date(Date.now() + intervalMs);
        });
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await takeABreak(state, ctx, intervalMs);
            await state.promiseWithAbort(refreshStatus(state, realm, ctx, playerAddress));
            state.updateState(() => {
                count++;
                state.data['_it'] = count;
                state.data['_nextAt'] = new Date(Date.now() + intervalMs);
            });
        }
    };
    const state = index_1.Workflow.createWorkflow(workflowExec, botId);
    state
        .start()
        .catch((err) => {
        ctx.ui.writeMessage(`autoRefresh #bot${state.id} error ${err.toString()}`);
    })
        .finally(() => {
        ctx.ui.writeMessage(`autoRefresh #bot${state.id} end!`);
    });
    ctx.ui.writeMessage(`autoRefresh #bot${state.id} started:
  - Interval: ${intervalMs / (1 * 60 * 1000)} mins
  `);
    captureStartedBot(state, args);
    return state;
}
exports.autoRefreshStatus = autoRefreshStatus;
async function autoPlayV1({ ctx, realm, playerAddress, args, }) {
    const { minePories, supportPori, timeOutHours } = args;
    const start = Date.now();
    const end = start + timeOutHours * 60 * 60 * 1000;
    const botId = `bot_${[...args.minePories, args.supportPori].join('_')}`;
    if (exports.AutoPlayDb[botId]) {
        ctx.ui.writeMessage(`bot with id ${botId} is running. skip it`);
        return;
    }
    const workflowExec = async (state) => {
        while (Date.now() < end) {
            let addvStats = await refreshStatus(state, realm, ctx, playerAddress);
            let activeMine = findActiveMine({ ctx, addvStats, args });
            if (!activeMine) {
                state.updateState(() => {
                    state.data['step'] = 'start_mine';
                });
                await state.promiseWithAbort(checkGasPrice({ ctx, end, state }));
                await state.promiseWithAbort(checkPoriMissionCapping({ ctx, args, state }));
                await state.promiseWithAbort(checkPortal({ ctx, args, state, end, playerAddress }));
                // 1. start new mine with portal
                await state.promiseWithAbort(index_1.Cmds.cmdDoMine({
                    ctx,
                    realm,
                    args: args.usePortal ? '1' : '0',
                    minePories,
                }));
                state.updateState(() => {
                    state.data['step'] = 'start_mine_finish';
                });
            }
            // 2. do support
            addvStats = await refreshStatus(state, realm, ctx, playerAddress);
            activeMine = findActiveMine({ ctx, addvStats, args });
            if (!activeMine) {
                console.log(addvStats);
                throw 'OoO';
            }
            const mineId = activeMine.mineId;
            const nextSupportAt = activeMine.atkAt;
            const shouldSupport = (0, moment_1.default)(nextSupportAt || 0).isAfter();
            if (shouldSupport) {
                state.updateState(() => {
                    state.data['step'] = `waiting_for_support. Wakeup at ${nextSupportAt.toLocaleString()} - ${(0, moment_1.default)(nextSupportAt).fromNow()}`;
                });
                await state.promiseWithAbort((0, utils_1.waitForMs)(nextSupportAt.valueOf() -
                    Date.now() +
                    ctx.setting.autoPlayMicroDelayMs));
                if (supportPori) {
                    state.updateState(() => {
                        state.data['step'] = 'begin_support';
                    });
                    await state.promiseWithAbort(doSupport(ctx, mineId, supportPori, realm));
                    state.updateState(() => {
                        state.data['step'] = 'end_support';
                    });
                }
            }
            // 3. do SBattle. before finish 30 mins
            const sAt = activeMine.blockedTo.valueOf() - SBATTLE_BEFORE_END_MS;
            const needToWaitForSMin = sAt - Date.now() + ctx.setting.autoPlayMicroDelayMs;
            if (needToWaitForSMin > 0) {
                state.updateState(() => {
                    state.data['step'] = `waiting_for_s. Wakeup at ${new Date(sAt).toLocaleString()} - ${(0, moment_1.default)(new Date(sAt)).fromNow()}`;
                });
                await state.promiseWithAbort((0, utils_1.waitForMs)(needToWaitForSMin));
                await state.promiseWithAbort(checkGasPrice({ ctx, end, state }));
                state.updateState(() => {
                    state.data['step'] = 'begin_s';
                });
                // CMD do SBattle
                await state.promiseWithAbort(index_1.Cmds.cmdDoSBattle({ ctx, realm, args: mineId.toString() }));
                state.updateState(() => {
                    state.data['step'] = 'end_s';
                });
            }
            // 4. do finish
            addvStats = await refreshStatus(state, realm, ctx, playerAddress);
            activeMine = findActiveMine({ ctx, addvStats, args });
            if (activeMine) {
                state.updateState(() => {
                    state.data['step'] = `waiting_for_finish. Wakeup at ${activeMine === null || activeMine === void 0 ? void 0 : activeMine.blockedTo.toLocaleString()} - ${(0, moment_1.default)(activeMine === null || activeMine === void 0 ? void 0 : activeMine.blockedTo).fromNow()}`;
                });
                await state.promiseWithAbort((0, utils_1.waitForMs)(activeMine.blockedTo.valueOf() -
                    Date.now() +
                    ctx.setting.autoPlayMicroDelayMs));
                await state.promiseWithAbort(checkGasPrice({ ctx, end, state }));
                state.updateState(() => {
                    state.data['step'] = 'begin_finish';
                });
                await state.promiseWithAbort(doFinishWithRetry(ctx, realm, mineId, state));
                state.updateState(() => {
                    state.data['step'] = 'end_finish';
                });
            }
            // done 1 loop
            await takeABreak(state, ctx);
        }
    };
    const state = index_1.Workflow.createWorkflow(workflowExec, botId);
    state.onChange = () => {
        ctx.ui.writeMessage(`autoPlay #bot${state.id} step ${state.data['step']}`);
    };
    state
        .start()
        .catch((err) => {
        ctx.ui.writeMessage(`autoPlay #bot${state.id} error ${err.toString()}`);
    })
        .finally(() => {
        ctx.ui.writeMessage(`autoPlay #bot${state.id} end!`);
    });
    ctx.ui.writeMessage(`autoPlay #bot${state.id} started:
  - BeginAt: ${new Date(start).toLocaleString()}
  - BeginEnd: ${new Date(end).toLocaleString()}
  - Duration: ${timeOutHours} hours
  `);
    captureStartedBot(state, args);
    return state;
}
exports.autoPlayV1 = autoPlayV1;
//----------------------------------------------------------//
// bot manager
//----------------------------------------------------------//
function stopBot(id) {
    const botInfo = exports.AutoPlayDb[id];
    if (!botInfo)
        return;
    botInfo.state.abort();
    delete exports.AutoPlayDb[id];
}
exports.stopBot = stopBot;
function captureStartedBot(state, args) {
    const id = state.id;
    state.finishDefered.promise
        .then((res) => {
        console.log('bot finish');
    })
        .catch((err) => {
        console.log('bot error', err);
    })
        .finally(() => {
        delete exports.AutoPlayDb[id];
    });
    exports.AutoPlayDb[id] = { state, args };
}
//----------------------------------------------------------//
// internal
//----------------------------------------------------------//
async function refreshStatus(state, realm, ctx, playerAddress) {
    await takeABreak(state, ctx);
    return await index_1.Computed.MyAdventure.refreshAdventureStatsForAddress({ realm, ctx }, playerAddress);
}
async function takeABreak(state, ctx, sec) {
    await state.promiseWithAbort((0, utils_1.waitForMs)(sec !== null && sec !== void 0 ? sec : ctx.setting.autoPlayMicroDelayMs));
}
async function checkGasPrice({ ctx, end, state, }) {
    const sleepInterval = 60000;
    const msgInfo = await ctx.ui.writeMessage(`checking gas...`);
    while (Date.now() < end) {
        const web3GasPrice = await index_1.WalletActions.currentGasPrice({ ctx });
        const valueInGweith = ctx.web3.utils.toWei(ctx.setting.safeGweith.toString(), 'gwei');
        if (+web3GasPrice > +valueInGweith) {
            ctx.ui.editMessage(msgInfo, `gas price higher than expected ${web3GasPrice} > ${valueInGweith}. Check again after ${sleepInterval}ms`);
            await state.promiseWithAbort((0, utils_1.waitForMs)(sleepInterval));
            continue;
        }
        ctx.ui.editMessage(msgInfo, `gas price ${web3GasPrice} is safe to go`);
        break;
    }
}
async function checkPoriMissionCapping({ ctx, args, state, }) {
    const pories = [...args.minePories];
    if (args.supportPori)
        pories.push(args.supportPori);
    const msgInfo = await ctx.ui.writeMessage(`checking pories capping...`);
    let maxMission = -1;
    for (const it of pories) {
        const missionCount = await (0, adventure_1.queryMissiontOfPoriSc)(ctx, it);
        if (missionCount > maxMission)
            maxMission = missionCount;
        if (missionCount > MAX_PORI_ENGAGED_MISSION) {
            throw new Error(`Pori mission capping reach ${it}: ${missionCount}`);
        }
    }
    ctx.ui.editMessage(msgInfo, `capping is safe to go. Current cap ${maxMission}/${MAX_PORI_ENGAGED_MISSION}`);
}
async function checkPortal({ ctx, args, playerAddress, end, state, }) {
    if (!args.usePortal)
        return;
    const msgInfo = await ctx.ui.writeMessage(`checking portal capping...`);
    const sleepInterval = 60000;
    while (Date.now() < end) {
        const portalCap = await index_1.Adventure.queryPortalInfoSc(ctx, playerAddress);
        if (portalCap.availableRiken < portalCap.nextMissionRequireRiken) {
            ctx.ui.editMessage(msgInfo, `portal capping is not enough. ${portalCap.availableRiken} left. Require ${portalCap.nextMissionRequireRiken} ... try again after ${sleepInterval / 1000}s`);
            await state.promiseWithAbort((0, utils_1.waitForMs)(sleepInterval));
            continue;
        }
        break;
    }
    ctx.ui.editMessage(msgInfo, `portal capping is safe to go`);
}
async function doSupport(ctx, mineId, SUPPORT_PORI, realm) {
    await index_1.Cmds.cmdDoSupport({
        ctx,
        realm,
        args: `${mineId}`,
        SUPPORT_PORI,
        customSlotPick: supportSlotPick_1.supportSlotPick,
    });
}
async function doFinishWithRetry(ctx, realm, mineId, state) {
    // delay 3 sec
    // Porichain time lag ??
    //  0x175b05a99aca3f64fcfad12bc6c60c0392625a3eca08e3a070f17aa3c36b1f7e
    await (0, utils_1.waitForMs)(30 * 1000);
    const doJob = async () => {
        await index_1.Cmds.cmdDoFinish({ ctx, realm, args: `${mineId}` });
    };
    await (0, utils_1.doTaskWithRetry)(4, doJob, (err, retryNo) => {
        ctx.ui.writeMessage(`autoPlay #bot${state.id} retry no ${retryNo} cmdDoFinish after error ${err.message}`);
    }, 60 * 1000);
}
function findActiveMine({ ctx, addvStats, args, }) {
    const minePories = [...args.minePories].map((itm) => itm.toString()).sort();
    for (const key in addvStats.mines) {
        const mineInfo = addvStats.mines[key];
        const farmerPories = (mineInfo.farmerPories || [])
            .map((itm) => itm.toString())
            .sort();
        const isMatch = (0, utils_1.isArrayIncludeAll)(farmerPories, minePories);
        if (isMatch)
            return mineInfo;
    }
    return null;
}


/***/ }),

/***/ "./packages/pori-actions/src/lib/auto/sbattleSlotPick.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sbattleSlotPick = void 0;
const lodash_1 = __webpack_require__("lodash");
const autoPlayWorkflow_1 = __webpack_require__("./packages/pori-actions/src/lib/auto/autoPlayWorkflow.ts");
async function sbattleSlotPick({ mineInfo, sCellInfo, isFarmer, ctx, }) {
    if (!mineInfo.supporterAddress) {
        await ctx.ui.writeMessage(`sbattle ${mineInfo.mineId}: empty supporter`);
        return null;
    }
    const parseMineInfo = _parseMineInfo(mineInfo);
    const { supporterPories, hasS, mineId, sIndex, farmerMaxPowerOf2, supporterMaxPowerOf2, farmerPories, supporterPoriesSortedByDecPower, farmerPoriesSortedByDecPower, powerOf, } = parseMineInfo;
    if (!hasS) {
        await ctx.ui.writeMessage(`sbattle ${mineId}: s not found`);
        return null;
    }
    if (supporterPories.length <= 3) {
        await ctx.ui.writeMessage(`sbattle ${mineId}: assit have 3 pories case`);
        return sbattleSlotPickCase3({ mineInfo, sCellInfo, isFarmer, ctx });
    }
    if (supporterMaxPowerOf2 > farmerMaxPowerOf2) {
        const esbCal = await ctx.contract.methods
            .getESB(farmerMaxPowerOf2, supporterMaxPowerOf2)
            .call();
        const esbPercentage = Math.round(+esbCal / 100);
        if (esbPercentage < autoPlayWorkflow_1.ESB_P_THRESHOLD_KEEP_BIG_REWARD) {
            await ctx.ui.writeMessage(`sbattle ${mineId}: max2Power lesser than supporter ${farmerMaxPowerOf2} < ${supporterMaxPowerOf2}. And ebs too low ${esbPercentage}`);
            return null;
        }
        await ctx.ui.writeMessage(`sbattle ${mineId}: ebs ${esbPercentage}`);
    }
    await ctx.ui.writeMessage(`sbattle ${mineId}: max2Power of supporter ${supporterMaxPowerOf2}, farmer ${farmerMaxPowerOf2}. sFarmer: ${sCellInfo.farmer.join(',')}, sSupport: ${sCellInfo.helper.join(',')}`);
    // TODO: optimize
    //    need consier missing case
    //      pori at s already. need find another one => maybe cost lower than global min
    // let { maxSum, minCost, max1, max2 } = _pickSMinimizeLoss(
    //   farmerPoriesSortedByDecPower,
    //   supporterMaxPowerOf2
    // );
    const max1 = farmerPoriesSortedByDecPower[0], max2 = farmerPoriesSortedByDecPower[1];
    const maxSum = max1.power + max2.power;
    const minCost = max1.rewardLevel + max2.rewardLevel;
    await ctx.ui.writeMessage(`sbattle ${mineId}: max2Power power ${maxSum} cost ${minCost} pair ${max1.id} - ${max1.power} - ${max1.rewardLevel}, ${max2.id} - ${max2.power} - ${max2.rewardLevel}`);
    const sFarmer = sCellInfo.farmer.map((itm) => +itm);
    const srcIds = [max1, max2]
        .filter((itm) => !sFarmer.includes(itm.id))
        .map((itm) => itm.id);
    const desIds = sFarmer.filter((itm) => ![max1.id, max2.id].includes(itm));
    // fill 0 for remaining
    if (desIds.length != srcIds.length) {
        const needToFill = srcIds.length - desIds.length;
        for (let i = 0; i < needToFill; i++) {
            desIds.push(0);
        }
    }
    await ctx.ui.writeMessage(`sbattle ${mineId}: move srcIds: ${srcIds.join(',')} -> desIds: ${desIds.join(',')} `);
    return {
        missionId: mineId,
        srcIds,
        desIds,
        sTreasureIndex: sIndex,
    };
}
exports.sbattleSlotPick = sbattleSlotPick;
async function sbattleSlotPickCase3({ mineInfo, sCellInfo, isFarmer, ctx, }) {
    const parseMineInfo = _parseMineInfo(mineInfo);
    const { mineId, sIndex, powerOf, farmerMaxPowerOf2, farmerPoriesSortedByDecPower, } = parseMineInfo;
    const sPowerFarmer = (0, lodash_1.sum)(sCellInfo.farmer.map((itm) => powerOf(itm)));
    const sPowerSupporter = (0, lodash_1.sum)(sCellInfo.helper.map((itm) => powerOf(itm)));
    // no need to play. win S already
    if (sPowerFarmer > sPowerSupporter) {
        await ctx.ui.writeMessage(`sbattle ${mineId}: explorer power higher ${sPowerFarmer} vs ${sPowerSupporter} and assit can not play s. nothing to do`);
        return null;
    }
    // swap 1 pori have power higher
    const minAtk = powerOf(sCellInfo.helper[0]);
    const poriInfo = _pickOneMinRewardLevelAndAtkGtXPori(parseMineInfo, minAtk);
    if (poriInfo) {
        await ctx.ui.writeMessage(`sbattle ${mineId}: move min rewardLevel -> S. ${poriInfo.id} - R:${poriInfo.rewardLevel} - Pw:${poriInfo.power}`);
        return {
            missionId: mineId,
            srcIds: [poriInfo.id],
            desIds: [0],
            sTreasureIndex: sIndex,
        };
    }
    // swap 2 pories power -> s
    if (minAtk > farmerMaxPowerOf2) {
        await ctx.ui.writeMessage(`sbattle ${mineId}: don't have 2 pories atk > ${minAtk}. nothing to do`);
        return null;
    }
    const max1 = farmerPoriesSortedByDecPower[0], max2 = farmerPoriesSortedByDecPower[1];
    const maxSum = max1.power + max2.power;
    const minCost = max1.rewardLevel + max2.rewardLevel;
    await ctx.ui.writeMessage(`sbattle ${mineId}: max2Power power ${maxSum} cost ${minCost} pair ${max1.id} - ${max1.power} - ${max1.rewardLevel}, ${max2.id} - ${max2.power} - ${max2.rewardLevel}`);
    const sFarmer = sCellInfo.farmer.map((itm) => +itm);
    const srcIds = [max1, max2]
        .filter((itm) => !sFarmer.includes(itm.id))
        .map((itm) => itm.id);
    const desIds = sFarmer.filter((itm) => ![max1.id, max2.id].includes(itm));
    // fill 0 for remaining
    if (desIds.length != srcIds.length) {
        const needToFill = srcIds.length - desIds.length;
        for (let i = 0; i < needToFill; i++) {
            desIds.push(0);
        }
    }
    await ctx.ui.writeMessage(`sbattle ${mineId}: move srcIds: ${srcIds.join(',')} -> desIds: ${desIds.join(',')} `);
    return {
        missionId: mineId,
        srcIds,
        desIds,
        sTreasureIndex: sIndex,
    };
}
function _parseMineInfo(mineInfo) {
    const farmerPories = mineInfo.farmerPories || [];
    const farmerRewardLevel = mineInfo.farmerRewardLevel || [];
    const farmerSlots = mineInfo.farmerSlots || [];
    const supporterPories = mineInfo.supporterPories || [];
    const supporterRewardLevel = mineInfo.supporterRewardLevel || [];
    const supporterSlots = mineInfo.supporterSlots || [];
    const mineId = mineInfo.mineId;
    const activeIndexs = [
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.farmerSlots) || []),
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.supporterSlots) || []),
    ];
    const activeRewardLevels = [...farmerRewardLevel, ...supporterRewardLevel];
    const sIndex = activeIndexs[activeRewardLevels.indexOf(4)];
    const powerOf = (id) => {
        return mineInfo.powers[id.toString()];
    };
    const farmerPoriesSortedByDecPower = (0, lodash_1.sortBy)(farmerPories.map((itm, index) => ({
        id: itm,
        index,
        power: powerOf(itm),
        rewardLevel: farmerRewardLevel[index],
    })), (a) => a.power).reverse();
    const supporterPoriesSortedByDecPower = (0, lodash_1.sortBy)(supporterPories.map((itm, index) => ({
        id: itm,
        index,
        power: powerOf(itm),
        rewardLevel: supporterRewardLevel[index],
    })), (a) => a.power).reverse();
    const farmerMaxPowerOf2 = farmerPoriesSortedByDecPower[0].power +
        farmerPoriesSortedByDecPower[1].power;
    const supporterMaxPowerOf2 = supporterPoriesSortedByDecPower[0].power +
        supporterPoriesSortedByDecPower[1].power;
    return {
        mineId,
        sIndex,
        hasS: !!sIndex,
        farmerPories,
        farmerRewardLevel,
        farmerSlots,
        supporterPories,
        supporterRewardLevel,
        supporterSlots,
        farmerPoriesSortedByDecPower,
        supporterPoriesSortedByDecPower,
        farmerMaxPowerOf2,
        supporterMaxPowerOf2,
        powerOf,
    };
}
function _pickOneMinRewardLevelPori(mineInfo) {
    const { farmerPoriesSortedByDecPower } = mineInfo;
    const res = (0, lodash_1.minBy)(farmerPoriesSortedByDecPower, (itm) => itm.rewardLevel);
    if (!res)
        return null;
    return res.id;
}
function _pickOneMinRewardLevelAndAtkGtXPori(mineInfo, minAtk) {
    const { farmerPoriesSortedByDecPower } = mineInfo;
    const tmp = farmerPoriesSortedByDecPower.filter((itm) => itm.power > minAtk);
    const res = (0, lodash_1.minBy)(tmp, (itm) => itm.rewardLevel);
    if (!res)
        return null;
    return res;
}
function _pickSMinimizeLoss(farmerPoriesSortedByDecPower, supporterMaxPowerOf2) {
    const arr = farmerPoriesSortedByDecPower.reverse();
    let max1 = farmerPoriesSortedByDecPower[0], max2 = farmerPoriesSortedByDecPower[1];
    let maxSum = 0, minCost = Number.MAX_VALUE;
    for (let i = 0; i < arr.length - 1; i++) {
        const p1 = arr[i];
        for (let j = i + 1; j < arr.length; j++) {
            const p2 = arr[j];
            if (maxSum < p1.power + p2.power &&
                p1.power + p2.power > supporterMaxPowerOf2 &&
                minCost > p1.rewardLevel + p2.rewardLevel) {
                max1 = p1;
                max2 = p2;
                maxSum = p1.power + p2.power;
                minCost = p1.rewardLevel + p2.rewardLevel;
            }
        }
    }
    return { maxSum, minCost, max1, max2 };
}


/***/ }),

/***/ "./packages/pori-actions/src/lib/auto/supportSlotPick.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.supportSlotPick = void 0;
const index_1 = __webpack_require__("./packages/pori-actions/src/index.ts");
const lodash_1 = __webpack_require__("lodash");
const autoPlayWorkflow_1 = __webpack_require__("./packages/pori-actions/src/lib/auto/autoPlayWorkflow.ts");
/*
  No supporter
    random new slot
  If has bigReward
    farmer found:
      calculate esb. If >= 15%
        send support to bigReward slot (protect it)
      else
        open new slot
    assit found: ignore -> open new slot
  else
    open new slot
*/
async function supportSlotPick({ mineInfo, isFarmer, pori, ctx, }) {
    var _a, _b;
    const supporterRewardLevel = (mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.supporterRewardLevel) || [];
    const farmerRewardLevel = (mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.farmerRewardLevel) || [];
    const hasSupporter = !!mineInfo.supporterAddress;
    const activeIndexs = [
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.farmerSlots) || []),
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.supporterSlots) || []),
    ];
    const activeRewardLevels = [...farmerRewardLevel, ...supporterRewardLevel];
    let slotIndex;
    const bigRewardIndex = activeIndexs[activeRewardLevels.indexOf(4)];
    const isFarmerFound = farmerRewardLevel.includes(4);
    let esbPercentage = NaN;
    let bigRewardEP = -1, bigRewardAP = -1;
    if (!hasSupporter)
        slotIndex = index_1.Adventure.randAdventureSlot(1, (0, lodash_1.uniq)(activeIndexs))[0];
    else if (hasSupporter && mineInfo.hasBigReward) {
        if (isFarmerFound) {
            // calculate ESB
            //  https://docs.poriverse.io/game-guide/chapter-1-the-lost-porian/esb-explorer-strike-back
            const farmerPories = (mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.farmerPories) || [];
            const supporterPories = (mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.supporterPories) || [];
            const farmerPori = farmerPories[farmerRewardLevel.indexOf(4)];
            bigRewardEP = (_a = mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.powers[farmerPori]) !== null && _a !== void 0 ? _a : 0;
            const supporterPori = supporterPories[supporterRewardLevel.indexOf(4)];
            bigRewardAP = (_b = mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.powers[supporterPori]) !== null && _b !== void 0 ? _b : 0;
            const esbCal = await ctx.contract.methods
                .getESB(bigRewardEP, bigRewardAP)
                .call();
            esbPercentage = Math.round(+esbCal / 100);
            // calculate ESB - end
            if (esbPercentage >= autoPlayWorkflow_1.ESB_P_THRESHOLD_KEEP_BIG_REWARD) {
                slotIndex = bigRewardIndex;
            }
            else
                slotIndex = index_1.Adventure.randAdventureSlot(1, (0, lodash_1.uniq)(activeIndexs))[0];
        }
        else
            slotIndex = index_1.Adventure.randAdventureSlot(1, (0, lodash_1.uniq)(activeIndexs))[0];
    }
    else {
        slotIndex = index_1.Adventure.randAdventureSlot(1, (0, lodash_1.uniq)(activeIndexs))[0];
    }
    console.log({
        isFarmer,
        activeIndexs,
        activeRewardLevels,
        bigRewardIndex,
        pori,
        slotIndex,
        isFarmerFound,
    });
    await ctx.ui.writeMessage(`roger that!. send pori ${pori} to support mineId:${mineInfo.mineId} at ${slotIndex} 

    - (bigRewardIndex: ${bigRewardIndex}, isFarmerFound:${isFarmerFound}) 
    - (bigRewardEP1: ${bigRewardEP}, bigRewardAP1: ${bigRewardAP}, esbPercentage: ${esbPercentage})`);
    return slotIndex;
}
exports.supportSlotPick = supportSlotPick;


/***/ }),

/***/ "./packages/pori-actions/src/lib/basic.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.scanEvents = exports.listenEvents = exports.getMineInfo = void 0;
async function getMineInfo({ contract }, mineId) {
    const mineInfo = await contract.methods.mines(mineId).call();
    const { state, farmer, helper, rewardMap } = mineInfo;
    return { state, farmer, helper, rewardMap };
}
exports.getMineInfo = getMineInfo;
async function listenEvents({ contract, }) {
    // To scan pass event from blockA -> blockB
    // use
    //  https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#getpastevents
    // Scan all event from currentTime
    return contract.events
        .allEvents()
        .on('connected', function (subscriptionId) {
        console.log(subscriptionId);
    });
}
exports.listenEvents = listenEvents;
async function scanEvents(ctx, { filter = 'allEvents', fromBlock, toBlock, }) {
    const contract = ctx.contract;
    return contract.getPastEvents(filter, {
        fromBlock,
        toBlock,
    });
}
exports.scanEvents = scanEvents;


/***/ }),

/***/ "./packages/pori-actions/src/lib/cmds/cmds.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cmdDoSBattle = exports.cmdDoSupport = exports.cmdDoAtk = exports.cmdDoFinish = exports.cmdDoMine = void 0;
const index_1 = __webpack_require__("./packages/pori-actions/src/index.ts");
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const lodash_1 = __webpack_require__("lodash");
const myAdventure_1 = __webpack_require__("./packages/pori-actions/src/lib/computed/myAdventure.ts");
const sbattleSlotPick_1 = __webpack_require__("./packages/pori-actions/src/lib/auto/sbattleSlotPick.ts");
const adventure_1 = __webpack_require__("./packages/pori-actions/src/lib/adventure.ts");
//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//
async function cmdDoMine({ ctx, realm, args, minePories, }) {
    if (!ctx.walletAcc) {
        console.warn('wallet channel not ready. Please run wallet_unlock first');
        return;
    }
    const tmp = args.split(' ');
    const usePortal = (0, utils_1.boolFromString)(tmp[0]);
    const poriants = minePories;
    const index = index_1.Adventure.randAdventureSlot(3);
    await ctx.ui.writeMessage(`roger that!. Start new mine. usePortal:${usePortal}`);
    const callData = ctx.contract.methods
        .startAdventure(
    // poriants
    poriants, 
    // index
    index, 
    // notPortal
    !usePortal)
        .encodeABI();
    console.log({
        poriants,
        index,
        usePortal,
    });
    const tx = {
        from: ctx.walletAcc.address,
        to: (0, pori_metadata_1.getIdleGameAddressSC)(ctx.env).address,
        data: callData, // Required
    };
    if (!ctx.walletAcc)
        await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);
    // Sign transaction
    const txHash = await index_1.WalletActions.sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
        ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    });
    if (txHash)
        await ctx.ui.writeMessage((0, pori_metadata_1.getChainExplorerTxHashLink)(ctx.env, txHash));
    else
        await ctx.ui.writeMessage(`Ố ồ..`);
}
exports.cmdDoMine = cmdDoMine;
//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//
async function cmdDoFinish({ ctx, realm, args, }) {
    if (!ctx.walletAcc) {
        console.warn('wallet channel not ready. Please run wallet_unlock first');
        return;
    }
    const tmp = args.split(' ');
    const mineId = parseInt(tmp[0]);
    if (Number.isNaN(mineId)) {
        return await ctx.ui.writeMessage(`Usage: /finish <mineId>`);
    }
    const playerAddress = ctx.playerAddress || '';
    const addvStats = await (0, myAdventure_1.refreshAdventureStatsForAddress)({ realm, ctx }, playerAddress);
    const mineInfo = addvStats.mines[mineId];
    if (!mineInfo) {
        console.log('opps. Mine status changed');
        await ctx.ui.writeMessage(`opps. Mine status changed. Already finished....`);
        return;
    }
    await ctx.ui.writeMessage(`roger that!. Finish mine: ${mineId}`);
    const callData = ctx.contract.methods
        .finish(
    // poriants
    mineId)
        .encodeABI();
    console.log({
        mineId,
    });
    const tx = {
        from: ctx.walletAcc.address,
        to: (0, pori_metadata_1.getIdleGameAddressSC)(ctx.env).address,
        data: callData, // Required
    };
    if (!ctx.walletAcc)
        await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);
    // Sign transaction
    const txHash = await index_1.WalletActions.sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
        ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    });
    if (txHash)
        await ctx.ui.writeMessage((0, pori_metadata_1.getChainExplorerTxHashLink)(ctx.env, txHash));
    else
        await ctx.ui.writeMessage(`Ố ồ..`);
}
exports.cmdDoFinish = cmdDoFinish;
//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//
async function cmdDoAtk({ ctx, realm, FORMATION, MINE_ATK_PRICE_FACTOR, args, }) {
    if (!ctx.walletAcc) {
        console.warn('wallet channel not ready. Please run wallet_unlock first');
        return;
    }
    const tmp = args.split(' ');
    const mineId = tmp[0];
    const usePortal = (0, utils_1.boolFromString)(tmp[1]);
    if (!mineId) {
        await ctx.ui.writeMessage('\tUsage: /atk <mineId> [usePortal = false]');
        return;
    }
    const addvStats = await (0, myAdventure_1.refreshAdventureStatsForAddress)({ realm, ctx }, ctx.playerAddress || '');
    await ctx.ui.writeMessage(`roger that!. Start atk mineId:${mineId} usePortal:${usePortal}`);
    console.log({ mineId, usePortal });
    const mineInfo = addvStats.targets[mineId];
    if (!mineInfo) {
        console.log('opps. Mine status changed');
        await ctx.ui.writeMessage(`opps. Mine status changed. Retreat....`);
        return;
    }
    const poriants = FORMATION;
    const index = index_1.Adventure.randAdventureSlot(3, mineInfo.farmerSlots);
    const callData = ctx.contract.methods
        .support1(
    // mineId
    mineId, 
    // poriants
    poriants, 
    // index
    index, 
    // notPortal
    !usePortal)
        .encodeABI();
    console.log({
        method: 'support1',
        mineId,
        poriants,
        index,
        usePortal,
        callData,
    });
    const web3GasPrice = await index_1.WalletActions.currentGasPrice({ ctx });
    const factor = MINE_ATK_PRICE_FACTOR;
    const tx = {
        from: ctx.walletAcc.address,
        to: (0, pori_metadata_1.getIdleGameAddressSC)(ctx.env).address,
        data: callData,
        gasPrice: +web3GasPrice * factor,
    };
    if (!ctx.walletAcc)
        await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);
    // Sign transaction
    const txHash = await index_1.WalletActions.sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
        ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    });
    if (txHash)
        await ctx.ui.writeMessage((0, pori_metadata_1.getChainExplorerTxHashLink)(ctx.env, txHash));
    else
        await ctx.ui.writeMessage(`Ố ồ..`);
}
exports.cmdDoAtk = cmdDoAtk;
async function cmdDoSupport({ ctx, realm, args, SUPPORT_PORI, customSlotPick = defaultSupportSlotPick, }) {
    if (!ctx.walletAcc) {
        console.warn('wallet channel not ready. Please run wallet_unlock first');
        return;
    }
    const tmp = args.split(' ');
    const mineId = tmp[0];
    if (!mineId) {
        await ctx.ui.writeMessage('\tUsage: /mine_support <mineId>');
        return;
    }
    const addvStats = await (0, myAdventure_1.refreshAdventureStatsForAddress)({ realm, ctx }, ctx.playerAddress || '');
    const mineInfo = addvStats.mines[mineId];
    if (!mineInfo) {
        console.log('opps. Mine status changed');
        await ctx.ui.writeMessage(`opps. Mine not found`);
        return;
    }
    const isFarmer = mineInfo.isFarmer;
    const pori = SUPPORT_PORI;
    const slotIndex = await customSlotPick({
        mineInfo,
        isFarmer,
        pori,
        ctx,
    });
    let callDataAbi = '';
    if (isFarmer) {
        callDataAbi = ctx.contract.methods
            .fortify(mineId, pori, slotIndex)
            .encodeABI();
    }
    else
        callDataAbi = ctx.contract.methods
            .support2(mineId, pori, slotIndex)
            .encodeABI();
    const tx = {
        from: ctx.walletAcc.address,
        to: (0, pori_metadata_1.getIdleGameAddressSC)(ctx.env).address,
        data: callDataAbi, // Required
    };
    if (!ctx.walletAcc)
        await ctx.ui.writeMessage(`Sir! please accept tx in trust wallet`);
    // Sign transaction
    const txHash = await index_1.WalletActions.sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
        ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    });
    if (txHash)
        await ctx.ui.writeMessage((0, pori_metadata_1.getChainExplorerTxHashLink)(ctx.env, txHash));
    else
        await ctx.ui.writeMessage(`Ố ồ..`);
}
exports.cmdDoSupport = cmdDoSupport;
// IF has bigReward (level = 4 at index i)
//    Support this index
// Else
//    Random remaining slots
async function defaultSupportSlotPick({ mineInfo, isFarmer, pori, ctx, }) {
    const activeIndexs = [
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.farmerSlots) || []),
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.supporterSlots) || []),
    ];
    const activeRewardLevels = [
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.farmerRewardLevel) || []),
        ...((mineInfo === null || mineInfo === void 0 ? void 0 : mineInfo.supporterRewardLevel) || []),
    ];
    const bigRewardIndex = activeIndexs[activeRewardLevels.indexOf(4)];
    const slotIndex = bigRewardIndex
        ? bigRewardIndex
        : index_1.Adventure.randAdventureSlot(1, (0, lodash_1.uniq)(activeIndexs))[0];
    console.log({
        isFarmer,
        activeIndexs,
        activeRewardLevels,
        bigRewardIndex,
        pori,
        slotIndex,
    });
    await ctx.ui.writeMessage(`roger that!. send pori ${pori} to support mineId:${mineInfo.mineId} at ${slotIndex} (bigRewardIndex: ${bigRewardIndex})`);
    return slotIndex;
}
//------------------------------------------------------------------------//
//
//------------------------------------------------------------------------//
async function cmdDoSBattle({ ctx, realm, args, }) {
    if (!ctx.walletAcc) {
        console.warn('wallet channel not ready. Please run wallet_unlock first');
        return;
    }
    const tmp = args.split(' ');
    const mineId = tmp[0];
    if (!mineId) {
        await ctx.ui.writeMessage('\tUsage: /sbattle <mineId>');
        return;
    }
    const playerAddress = ctx.playerAddress || '';
    const addvStats = await (0, myAdventure_1.refreshAdventureStatsForAddress)({ realm, ctx }, playerAddress);
    const mineInfo = addvStats.mines[mineId];
    if (!mineInfo) {
        await ctx.ui.writeMessage(`opps. Mine not found`);
        return;
    }
    await ctx.ui.writeMessage(`roger that!. SBattle for mine: ${mineId}`);
    const sCellInfo = await (0, adventure_1.getPoriansAtSCellSc)(ctx, mineId);
    const sbattleCmd = await (0, sbattleSlotPick_1.sbattleSlotPick)({
        ctx,
        mineInfo,
        sCellInfo,
        isFarmer: true,
    });
    if (!sbattleCmd) {
        return;
    }
    // missionId
    // srcIds
    // desIds
    // sTreasure
    const callData = ctx.contract.methods
        .swapPorians(sbattleCmd.missionId, sbattleCmd.srcIds, sbattleCmd.desIds, sbattleCmd.sTreasureIndex)
        .encodeABI();
    const tx = {
        from: ctx.walletAcc.address,
        to: (0, pori_metadata_1.getIdleGameAddressSC)(ctx.env).address,
        data: callData, // Required
    };
    // Sign transaction
    const txHash = await index_1.WalletActions.sendRequestForWalletConnectTx({ ctx }, tx, (r) => {
        ctx.ui.writeMessage(`on Receipt: ${r.transactionHash}`);
    });
    if (txHash)
        await ctx.ui.writeMessage((0, pori_metadata_1.getChainExplorerTxHashLink)(ctx.env, txHash));
    else
        await ctx.ui.writeMessage(`Ố ồ..`);
}
exports.cmdDoSBattle = cmdDoSBattle;


/***/ }),

/***/ "./packages/pori-actions/src/lib/computed/myAdventure.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.genLast7DaysGraphData = exports.refreshAdventureStatsForAddress = void 0;
const tslib_1 = __webpack_require__("tslib");
const index_1 = __webpack_require__("./packages/pori-actions/src/index.ts");
const Repos = tslib_1.__importStar(__webpack_require__("./packages/pori-repositories/src/index.ts"));
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const lodash_1 = __webpack_require__("lodash");
const moment_1 = tslib_1.__importDefault(__webpack_require__("moment"));
const adventure_1 = __webpack_require__("./packages/pori-actions/src/lib/adventure.ts");
const url_1 = __webpack_require__("url");
const QUICK_CHART_URL = 'https://quickchart.io/chart/render/sm-d5f8d67a-d271-4d30-9ae1-be744bd2627e';
async function refreshAdventureStatsForAddress({ realm, ctx, options = {
    withGasPrice: false,
    withPortal: false,
    withPrice: false,
}, }, addr) {
    var _a, _b;
    const createdBlock = (0, pori_metadata_1.getIdleGameAddressSC)(ctx.env).createdBlock;
    await index_1.Input.updateEventDb(realm, ctx, {
        createdBlock,
    });
    const activeAddr = addr;
    const now = Date.now();
    const viewData = await index_1.DataView.computePlayerAdventure({
        realm,
        playerAddress: activeAddr,
        realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });
    // humanView
    const humanView = {
        note: index_1.DataView.humanrizeNote(viewData),
        // my active adventures
        mines: {},
        // protential target
        targets: {},
        protentialTarget: [],
        activeMines: 0,
        canDoNextAction: false,
        nextActionAt: '',
        nextActionAtDate: new Date(),
        nextAtkAt: '',
        nextAtkAtDate: new Date(),
        gasPriceGWEI: '',
    };
    for (const k of Object.keys(viewData.activeAdventures)) {
        const value = viewData.activeAdventures[k];
        if (value.farmerAddress === activeAddr ||
            value.supporterAddress === activeAddr)
            humanView.mines[k] = index_1.DataView.humanrizeAdventureInfo(ctx, realm, value, true);
        else if (value.state === 'AdventureStarted') {
            humanView.targets[k] = index_1.DataView.humanrizeAdventureInfo(ctx, realm, value);
        }
    }
    humanView.protentialTarget = Object.keys(humanView.targets)
        .map((key) => {
        var _a, _b, _c;
        const val = humanView.targets[key];
        const sinceSec = (now - new Date((_a = val.startTime) !== null && _a !== void 0 ? _a : 0).valueOf()) / 1000;
        return {
            link: val.link,
            mineId: val.mineId,
            hasBigReward: val.hasBigReward,
            startTimeLocalTime: new Date((_b = val.startTime) !== null && _b !== void 0 ? _b : 0).toLocaleString(),
            startTime: new Date((_c = val.startTime) !== null && _c !== void 0 ? _c : 0),
            sinceSec,
        };
    })
        .sort((a, b) => {
        return +a.hasBigReward - +b.hasBigReward;
    });
    humanView.activeMines = Object.keys(humanView.mines).length;
    // mine completed by farmer. But our poriant still lock
    if (humanView.note.readyToStart === false)
        humanView.activeMines++;
    if (options.withGasPrice) {
        const web3GasPrice = await index_1.WalletActions.currentGasPrice({ ctx });
        humanView.gasPriceGWEI = ctx.web3.utils.fromWei(web3GasPrice, 'gwei');
    }
    // next action timeline
    const timeViewMine = Object.values(humanView.mines);
    const noBlock = timeViewMine.every((itm) => {
        return !!itm.canCollect;
    });
    const nextActionAt = (_a = (0, lodash_1.maxBy)(timeViewMine, (v) => v.blockedTo.valueOf())) === null || _a === void 0 ? void 0 : _a.blockedTo;
    const nextAtkAt = (_b = (0, lodash_1.minBy)(timeViewMine.filter((itm) => itm.atkAt.valueOf() > now), (v) => v.atkAt.valueOf())) === null || _b === void 0 ? void 0 : _b.atkAt;
    humanView.canDoNextAction = humanView.note.readyToStart && noBlock;
    if (nextActionAt) {
        humanView.nextActionAt = `${nextActionAt.toLocaleString()} - ${(0, moment_1.default)(nextActionAt).fromNow()}`;
    }
    humanView.nextActionAtDate = nextActionAt;
    if (nextAtkAt) {
        humanView.nextAtkAt = `${nextAtkAt.toLocaleString()} - ${(0, moment_1.default)(nextAtkAt).fromNow()}`;
    }
    humanView.nextAtkAtDate = nextAtkAt;
    // stats
    const toDayNo = (0, moment_1.default)().startOf('D').unix();
    humanView.todayStats = viewData.finishedAdventures[toDayNo];
    // portal
    if (options.withPortal) {
        humanView.portalInfo = await (0, adventure_1.queryPortalInfoSc)(ctx, addr);
    }
    // price
    if (options.withPrice) {
        humanView.price = await (0, index_1.token2Usd)(ctx);
        if (humanView.todayStats) {
            humanView.todayStats.rigyUsd =
                humanView.todayStats.totalRigy * humanView.price.rigy2Usd;
            humanView.todayStats.rikenUsd =
                humanView.todayStats.totalRiken * humanView.price.rken2Usd;
        }
    }
    return humanView;
}
exports.refreshAdventureStatsForAddress = refreshAdventureStatsForAddress;
async function genLast7DaysGraphData({ ctx, realm, playerAddress, }) {
    const viewData = await index_1.DataView.computePlayerAdventure({
        realm,
        playerAddress: playerAddress,
        realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
    });
    const entries = Object.entries(viewData.finishedAdventures);
    const last7Days = entries
        .map((itm) => itm[1])
        .sort((a, b) => b.unixDay - a.unixDay)
        .slice(0, 7)
        .reverse();
    const graphData = {
        labels: [],
        data1: [],
        data2: [],
    };
    for (const it of last7Days) {
        const tmp = (0, moment_1.default)(it.timestamp).format('MMM-DD');
        graphData.labels.push(tmp);
        graphData.data1.push(Math.round(it.totalRigy).toString());
        graphData.data2.push(Math.round(it.totalRiken).toString());
    }
    const url = new url_1.URL(QUICK_CHART_URL);
    url.searchParams.append('labels', graphData.labels.join(','));
    url.searchParams.append('data1', graphData.data1.join(','));
    return { graphData, url: url.toString() };
}
exports.genLast7DaysGraphData = genLast7DaysGraphData;


/***/ }),

/***/ "./packages/pori-actions/src/lib/dataView/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./packages/pori-actions/src/lib/dataView/playerAdventure.ts"), exports);


/***/ }),

/***/ "./packages/pori-actions/src/lib/dataView/playerAdventure.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.humanrizeNote = exports.humanrizeAdventureInfo = exports.computePlayerAdventure = void 0;
const tslib_1 = __webpack_require__("tslib");
const pori_repositories_1 = __webpack_require__("./packages/pori-repositories/src/index.ts");
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const moment_1 = tslib_1.__importDefault(__webpack_require__("moment"));
const TOKEN_DECIMAL = 18;
const TOKEN_CONVERT_CONSTANT = 10 ** TOKEN_DECIMAL;
const HEAD_VERSION = '1';
async function computePlayerAdventure(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { realm, playerAddress } = options;
    const viewId = computeViewId(options);
    const lastViewIns = await getLastView(options);
    const { cursor } = lastViewIns;
    const viewData = JSON.parse(lastViewIns.data);
    const allEvents = options.realmEventStore.filtered(`
      _id > oid(${cursor}) && (
        type="AdventureStarted" ||
        type="AdventureSupported1" ||
        type="AdventureFortified" ||
        type="AdventureSupported2" ||
        type="SBattleSwapped" ||
        type="AdventureFinished"
      )
    `);
    if (allEvents.length <= 0)
        return viewData;
    console.log('need to process', { playerAddress, count: allEvents.length });
    for (const it of allEvents) {
        switch (it.type) {
            case pori_metadata_1.EIdleGameSCEventType.AdventureStarted:
                {
                    const evData = it.data;
                    const isFarmer = evData.farmer === playerAddress;
                    viewData.activeAdventures[evData.mineId] = {
                        mineId: evData.mineId,
                        state: 'AdventureStarted',
                        isFarmer,
                        farmerAddress: evData.farmer,
                        startTime: new Date(evData.startTime * 1000),
                        farmerEndTime: new Date(evData.blockedTime * 1000),
                        farmerPories: [...evData.porians],
                        farmerRewardLevel: [...evData.rewardLevels],
                        farmerSlots: [...evData.indexes],
                    };
                }
                break;
            case pori_metadata_1.EIdleGameSCEventType.AdventureSupported1:
                {
                    const evData = it.data;
                    const isSupporter = evData.helper === playerAddress;
                    const mineInfo = viewData.activeAdventures[evData.mineId];
                    if (!mineInfo) {
                        console.log('missing', evData.mineId);
                        break;
                    }
                    // not interesting
                    if (!(isSupporter || mineInfo.isFarmer)) {
                        delete viewData.activeAdventures[evData.mineId];
                        break;
                    }
                    viewData.activeAdventures[evData.mineId] = {
                        ...mineInfo,
                        state: 'AdventureSupported1',
                        isSupporter,
                        supporterEndTime: new Date(evData.blockedTime * 1000),
                        supporterAddress: evData.helper,
                        supporterPories: evData.porians,
                        supporterRewardLevel: evData.rewardLevels,
                        supporterSlots: evData.indexes,
                    };
                }
                break;
            case pori_metadata_1.EIdleGameSCEventType.AdventureFortified:
                {
                    const evData = it.data;
                    const mineInfo = viewData.activeAdventures[evData.mineId];
                    // not interesting
                    if (!mineInfo)
                        break;
                    if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
                        delete viewData.activeAdventures[evData.mineId];
                        break;
                    }
                    viewData.activeAdventures[evData.mineId] = {
                        ...mineInfo,
                        state: 'AdventureFortified',
                        farmerEndTime: new Date(evData.blockedTime * 1000),
                        // add more pori
                        farmerPories: [...((_a = mineInfo.farmerPories) !== null && _a !== void 0 ? _a : []), evData.porian],
                        farmerRewardLevel: [
                            ...((_b = mineInfo.farmerRewardLevel) !== null && _b !== void 0 ? _b : []),
                            evData.rewardLevel,
                        ],
                        farmerSlots: [...((_c = mineInfo.farmerSlots) !== null && _c !== void 0 ? _c : []), evData.index],
                    };
                }
                break;
            case pori_metadata_1.EIdleGameSCEventType.AdventureSupported2:
                {
                    const evData = it.data;
                    const mineInfo = viewData.activeAdventures[evData.mineId];
                    // not interesting
                    if (!mineInfo)
                        break;
                    if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
                        delete viewData.activeAdventures[evData.mineId];
                        break;
                    }
                    viewData.activeAdventures[evData.mineId] = {
                        ...mineInfo,
                        state: 'AdventureSupported2',
                        supporterEndTime: new Date(evData.blockedTime * 1000),
                        // add more pori
                        supporterPories: [
                            ...((_d = mineInfo.supporterPories) !== null && _d !== void 0 ? _d : []),
                            evData.porian,
                        ],
                        supporterRewardLevel: [
                            ...((_e = mineInfo.supporterRewardLevel) !== null && _e !== void 0 ? _e : []),
                            evData.rewardLevel,
                        ],
                        supporterSlots: [...((_f = mineInfo.supporterSlots) !== null && _f !== void 0 ? _f : []), evData.index],
                    };
                }
                break;
            case pori_metadata_1.EIdleGameSCEventType.SBattleSwapped:
                {
                    const evData = it.data;
                    const mineInfo = viewData.activeAdventures[evData.mineId];
                    // not interesting
                    if (!mineInfo)
                        break;
                    if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
                        delete viewData.activeAdventures[evData.mineId];
                        break;
                    }
                    const { farmer, from, to, porians } = evData;
                    let rewardLevel, slots, pories;
                    if (mineInfo.isFarmer) {
                        pories = mineInfo.farmerPories || [];
                        rewardLevel = mineInfo.farmerRewardLevel || [];
                        slots = mineInfo.farmerSlots || [];
                    }
                    else {
                        pories = mineInfo.supporterPories || [];
                        rewardLevel = mineInfo.supporterRewardLevel || [];
                        slots = mineInfo.supporterSlots || [];
                    }
                    // do swap
                    const poriIdOutside = +porians[0];
                    const poriIdInside = +porians[1];
                    const outsideIndex = pories.findIndex((itm) => itm === poriIdOutside);
                    const insideIndex = pories.findIndex((itm) => itm === poriIdInside);
                    const outsideRewardLevel = rewardLevel[outsideIndex];
                    const outsideSlot = slots[outsideIndex];
                    const insideRewardLevel = rewardLevel[insideIndex] || 4;
                    const insideSlot = slots[insideIndex] || +to;
                    if (poriIdInside) {
                        rewardLevel[insideIndex] = outsideRewardLevel;
                        slots[insideIndex] = outsideSlot;
                    }
                    rewardLevel[outsideIndex] = insideRewardLevel;
                    slots[outsideIndex] = insideSlot;
                    if (mineInfo.isFarmer) {
                        viewData.activeAdventures[evData.mineId] = {
                            ...mineInfo,
                            farmerPories: pories,
                            farmerRewardLevel: rewardLevel,
                            farmerSlots: slots,
                        };
                    }
                    else {
                        viewData.activeAdventures[evData.mineId] = {
                            ...mineInfo,
                            supporterPories: pories,
                            supporterRewardLevel: rewardLevel,
                            supporterSlots: slots,
                        };
                    }
                }
                break;
            case pori_metadata_1.EIdleGameSCEventType.AdventureFinished:
                {
                    const evData = it.data;
                    const mineInfo = viewData.activeAdventures[evData.mineId];
                    // not interesting
                    if (!mineInfo)
                        break;
                    if (!(mineInfo.isSupporter || mineInfo.isFarmer)) {
                        delete viewData.activeAdventures[evData.mineId];
                        break;
                    }
                    delete viewData.activeAdventures[evData.mineId];
                    const dateNo = (0, moment_1.default)(mineInfo.isSupporter
                        ? mineInfo.supporterEndTime
                        : mineInfo.farmerEndTime)
                        .startOf('D')
                        .unix();
                    const previous = viewData.finishedAdventures[dateNo] || {
                        unixDay: dateNo,
                        timestamp: new Date(dateNo * 1000),
                        finishedMineIds: [],
                        totalRigy: 0,
                        totalRiken: 0,
                    };
                    const rigyReward = mineInfo.isSupporter
                        ? evData.helperReward1
                        : evData.farmerReward1;
                    const rikenReward = mineInfo.isSupporter
                        ? evData.helperReward2
                        : evData.farmerReward2;
                    viewData.finishedAdventures[dateNo] = {
                        ...previous,
                        finishedMineIds: [...previous.finishedMineIds, mineInfo.mineId],
                        totalRigy: previous.totalRigy +
                            parseFloat(rigyReward.toString()) / TOKEN_CONVERT_CONSTANT,
                        totalRiken: previous.totalRiken +
                            parseFloat(rikenReward.toString()) / TOKEN_CONVERT_CONSTANT,
                    };
                    // add note
                    const prevNote = (_g = viewData.note) !== null && _g !== void 0 ? _g : {};
                    viewData.note = {
                        ...prevNote,
                        lastMine: mineInfo.mineId,
                        lastMineUnlockAt: mineInfo.isSupporter
                            ? mineInfo.supporterEndTime
                            : mineInfo.farmerEndTime,
                    };
                }
                break;
            default:
                break;
        }
    }
    pori_repositories_1.DataViewRepo.txSync(realm, () => {
        lastViewIns.cursor = allEvents[allEvents.length - 1]._id.toHexString();
        lastViewIns.data = JSON.stringify(viewData);
    });
    return viewData;
}
exports.computePlayerAdventure = computePlayerAdventure;
async function getLastView(options) {
    const { realm } = options;
    const viewId = computeViewId(options);
    let viewIns = await pori_repositories_1.DataViewRepo.findOne(realm, viewId);
    if (!viewIns) {
        const defaultData = pori_repositories_1.DataViewModel.generate(viewId, '000000000000000000000000', defaultViewData(options), HEAD_VERSION);
        viewIns = await pori_repositories_1.DataViewRepo.createWithTx(realm, defaultData);
    }
    return viewIns;
}
function computeViewId(options) {
    return `player:adventure:${options.playerAddress}`;
}
function defaultViewData(options) {
    return {
        playerAddress: options.playerAddress,
        activeAdventures: {},
        finishedAdventures: {},
        note: {},
    };
}
function humanrizeAdventureInfo(ctx, realm, advIno, withPoriePower = false) {
    var _a, _b, _c, _d, _e, _f;
    const startTime = advIno.startTime
        ? new Date(advIno.startTime).toLocaleString()
        : undefined;
    const farmerEndTime = advIno.farmerEndTime
        ? new Date(advIno.farmerEndTime).toLocaleString()
        : undefined;
    const supporterEndTime = advIno.supporterEndTime
        ? new Date(advIno.supporterEndTime).toLocaleString()
        : undefined;
    let canCollect = undefined;
    const now = Date.now();
    if (advIno.isFarmer && advIno.farmerEndTime) {
        canCollect = now > new Date(advIno.farmerEndTime).valueOf();
    }
    if (advIno.isSupporter && advIno.supporterEndTime) {
        canCollect = now > new Date(advIno.supporterEndTime).valueOf();
    }
    const blockedTo = advIno.isFarmer
        ? new Date(advIno.farmerEndTime)
        : new Date(advIno.supporterEndTime);
    const baseAdvLink = (0, pori_metadata_1.getAdventureBaseLink)(ctx.env);
    const link = `${baseAdvLink}/missions/${advIno.mineId}`;
    const hasBigRewardFarmer = ((_b = (_a = advIno.farmerRewardLevel) === null || _a === void 0 ? void 0 : _a.filter((itm) => itm >= 4).length) !== null && _b !== void 0 ? _b : 0) > 0;
    const hasBigRewardSupporter = ((_d = (_c = advIno.supporterRewardLevel) === null || _c === void 0 ? void 0 : _c.filter((itm) => itm >= 4).length) !== null && _d !== void 0 ? _d : 0) > 0;
    const turnTime = {};
    const { farmerAtkStartAt, supporterAtkStartAt } = (0, pori_metadata_1.calculateMineTurnTime)(new Date(advIno.startTime || ''));
    turnTime.farmerAtkTime = farmerAtkStartAt.toLocaleString();
    turnTime.supporterAtkTime = supporterAtkStartAt.toLocaleString();
    // calculate pories power
    const powers = {};
    if (withPoriePower) {
        const farmerPories = (_e = advIno.farmerPories) !== null && _e !== void 0 ? _e : [];
        for (const id of farmerPories) {
            const info = pori_repositories_1.PoriRepo.findOneSync(realm, id);
            if (info)
                powers[id] = info.minePower;
        }
        const supportPories = (_f = advIno.supporterPories) !== null && _f !== void 0 ? _f : [];
        for (const id of supportPories) {
            const info = pori_repositories_1.PoriRepo.findOneSync(realm, id);
            if (info)
                powers[id] = info.helpPower;
        }
    }
    return {
        link,
        canCollect,
        hasBigReward: hasBigRewardFarmer || hasBigRewardSupporter,
        ...advIno,
        startTime,
        farmerEndTime,
        supporterEndTime,
        ...turnTime,
        atkAt: advIno.isFarmer ? farmerAtkStartAt : supporterAtkStartAt,
        blockedTo,
        powers,
    };
}
exports.humanrizeAdventureInfo = humanrizeAdventureInfo;
function humanrizeNote(data) {
    const note = data.note || {};
    const res = {
        ...note,
    };
    if (note.lastMineUnlockAt) {
        const tmp = new Date(note.lastMineUnlockAt);
        res.lastMineUnlockAt = tmp.toLocaleString();
        res.readyToStart = Date.now() > tmp.valueOf();
    }
    return res;
}
exports.humanrizeNote = humanrizeNote;
//--------------------------------------------------------------
// Note:
// all events
//  -> create
//     -> new mineObj
// -> support 1
//     -> update
//   if support != me || farmer != me => delete
// -> porify
//   if have mine -> update
// -> support 2
//   if have mine -> update
// -> finish
//   if have mine -> update + capture reward -> delete


/***/ }),

/***/ "./packages/pori-actions/src/lib/exchange/binance.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.queryBinancePrice = void 0;
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
async function queryBinancePrice({ ctx, pair, }) {
    // https://api.binance.com/api/v3/ticker/price?symbol=LUNAUSDT
    const baseURL = 'https://api.binance.com';
    const res = await utils_1.axiosIns.request({
        method: 'get',
        baseURL,
        url: `/api/v3/ticker/price`,
        params: {
            symbol: pair.toUpperCase(),
        },
    });
    if (res.status !== 200)
        throw new Error(`Request failed status ${res.status} - ${res.data}`);
    const data = JSON.parse(res.data);
    return data;
}
exports.queryBinancePrice = queryBinancePrice;


/***/ }),

/***/ "./packages/pori-actions/src/lib/exchange/kyberPool.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getKyberPoolRIKENPrice = exports.getKyberPoolRIGYPrice = void 0;
const sdk_1 = __webpack_require__("@dynamic-amm/sdk");
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
let lazyProvider;
const PairCacheDb = {};
async function getProvider({ ctx }) {
    if (lazyProvider)
        return lazyProvider;
    const etherJs = await Promise.resolve().then(() => __importStar(__webpack_require__("@ethersproject/providers")));
    const url = (0, pori_metadata_1.getWeb3NodeUriPolygonHttp)();
    lazyProvider = new etherJs.JsonRpcProvider(url);
    return lazyProvider;
}
async function getPairData(ctx, tokenA, tokenB) {
    const KyberFactoryAddress = (0, pori_metadata_1.getKyberSwapFactoryAddress)(ctx.env);
    const provider = await getProvider({ ctx });
    const key = `${tokenA.address}_${tokenB.address}`;
    if (PairCacheDb[key])
        return PairCacheDb[key];
    PairCacheDb[key] = await sdk_1.Fetcher.fetchPairData(tokenA, tokenB, KyberFactoryAddress, provider);
    return PairCacheDb[key];
}
async function getKyberPoolRIGYPrice({ ctx, amountInWei = '1000000000000000000', }) {
    const tokenInfo = (0, pori_metadata_1.getRIGYTokenInfoOnPolygon)();
    const RIGYToken = new sdk_1.Token(+tokenInfo.chainId, tokenInfo.tokenAddress, +tokenInfo.decimal, tokenInfo.symbol);
    const pools = await getPairData(ctx, RIGYToken, sdk_1.WETH[RIGYToken.chainId]);
    const route = new sdk_1.Route(pools, sdk_1.WETH[RIGYToken.chainId]);
    const trade = new sdk_1.Trade(route, new sdk_1.TokenAmount(sdk_1.WETH[RIGYToken.chainId], amountInWei), sdk_1.TradeType.EXACT_INPUT);
    return {
        'RIGY->MATIC': trade.executionPrice.invert().toSignificant(6),
        'MATIC->RIGY': trade.executionPrice.toSignificant(6),
    };
}
exports.getKyberPoolRIGYPrice = getKyberPoolRIGYPrice;
async function getKyberPoolRIKENPrice({ ctx, amountInWei = '1000000000000000000', }) {
    const tokenInfo = (0, pori_metadata_1.getRIKENTokenInfoOnPolygon)();
    const RIKENToken = new sdk_1.Token(+tokenInfo.chainId, tokenInfo.tokenAddress, +tokenInfo.decimal, tokenInfo.symbol);
    const pools = await getPairData(ctx, RIKENToken, sdk_1.WETH[RIKENToken.chainId]);
    const route = new sdk_1.Route(pools, sdk_1.WETH[RIKENToken.chainId]);
    const trade = new sdk_1.Trade(route, new sdk_1.TokenAmount(sdk_1.WETH[RIKENToken.chainId], amountInWei), sdk_1.TradeType.EXACT_INPUT);
    return {
        'RIKEN->MATIC': trade.executionPrice.invert().toSignificant(6),
        'MATIC->RIKEN': trade.executionPrice.toSignificant(6),
    };
}
exports.getKyberPoolRIKENPrice = getKyberPoolRIKENPrice;


/***/ }),

/***/ "./packages/pori-actions/src/lib/exchange/token2Usd.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.token2Usd = void 0;
const binance_1 = __webpack_require__("./packages/pori-actions/src/lib/exchange/binance.ts");
const kyberPool_1 = __webpack_require__("./packages/pori-actions/src/lib/exchange/kyberPool.ts");
const CACHE_TIMEOUT_MS = 1 * 60 * 1000; // 1 min
const Cache = {
    rigy2Usd: 0,
    rken2Usd: 0,
    _time: 0,
};
async function token2Usd(ctx) {
    const now = Date.now();
    if (now - Cache._time < CACHE_TIMEOUT_MS) {
        return {
            rigy2Usd: Cache.rigy2Usd,
            rken2Usd: Cache.rken2Usd,
        };
    }
    const rigyPoolInfo = await (0, kyberPool_1.getKyberPoolRIGYPrice)({ ctx });
    const rikenPoolInfo = await (0, kyberPool_1.getKyberPoolRIKENPrice)({ ctx });
    const [maticBusd] = await Promise.all([
        (0, binance_1.queryBinancePrice)({ ctx, pair: 'MATICBUSD' }),
    ]);
    Cache.rigy2Usd = +rigyPoolInfo['RIGY->MATIC'] * +maticBusd.price;
    Cache.rken2Usd = +rikenPoolInfo['RIKEN->MATIC'] * +maticBusd.price;
    Cache._time = now;
    return {
        rigy2Usd: Cache.rigy2Usd,
        rken2Usd: Cache.rken2Usd,
    };
}
exports.token2Usd = token2Usd;


/***/ }),

/***/ "./packages/pori-actions/src/lib/input/pullData.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateEventDb = void 0;
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const pori_repositories_1 = __webpack_require__("./packages/pori-repositories/src/index.ts");
const basic_1 = __webpack_require__("./packages/pori-actions/src/lib/basic.ts");
const queryPoriApi_1 = __webpack_require__("./packages/pori-actions/src/lib/queryPoriApi.ts");
const transformIdleGameEvent2Database_1 = __webpack_require__("./packages/pori-actions/src/lib/transformer/transformIdleGameEvent2Database.ts");
async function updateEventDb(realm, ctx, { createdBlock }) {
    try {
        const scData = await pori_repositories_1.IdleGameSCMetadataRepo.getOrCreateWithTx(realm, 'default', {
            updatedBlock: createdBlock,
            createdBlock: createdBlock,
        });
        let from = scData.updatedBlock + 1;
        const batchSize = 500;
        const headBlock = await ctx.web3.eth.getBlockNumber();
        console.log('top block', headBlock);
        console.log('context', scData.toJSON());
        while (from < headBlock) {
            const to = Math.min(from + batchSize, headBlock);
            console.log('scan from ', { from, to });
            const events = await (0, basic_1.scanEvents)(ctx, {
                filter: 'allEvents',
                fromBlock: from,
                toBlock: to,
            });
            from = to + 1;
            pori_repositories_1.IdleGameSCMetadataRepo.txSync(realm, () => {
                scData.updatedBlock = to;
                const transformedEvents = events
                    .map((itm) => pori_metadata_1.IdleGameSc.parseIdleGameScEvent(itm))
                    .filter(Boolean);
                for (const iterator of transformedEvents) {
                    pori_repositories_1.IdleGameSCEventRepo.create(realm, pori_repositories_1.IdleGameSCEventDataModel.generate(iterator));
                }
            });
        }
        await updateKnowleageDb(realm, ctx);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        // noop
    }
}
exports.updateEventDb = updateEventDb;
async function updateKnowleageDb(realm, ctx) {
    const metadata = await pori_repositories_1.IdleGameSCMetadataRepo.findOne(realm, 'default');
    if (!metadata)
        return;
    const knCursor = metadata.extras['knCursor'] || '000000000000000000000000';
    const events = await pori_repositories_1.IdleGameSCEventRepo.findAll(realm);
    const scanner = events.filtered(`_id > oid(${knCursor})`);
    console.log(`updateKnowleageDb need to update ${scanner.length} events`);
    const total = scanner.length;
    if (total <= 0)
        return;
    const resolveNft = async (id) => {
        const data = await (0, queryPoriApi_1.queryNftInfo)(id, ctx);
        // await waitForMs(1000);
        return data;
    };
    let count = 0;
    const saveInterval = 10;
    const onIt = (id, forceSave = false) => {
        count++;
        if (forceSave || count % saveInterval === 0) {
            pori_repositories_1.IdleGameSCMetadataRepo.txSync(realm, () => {
                metadata.extras['knCursor'] = id.toHexString();
            });
        }
        console.log('onit', id, count / total);
    };
    await (0, transformIdleGameEvent2Database_1.transformIdleGameEvent2Database)(realm, Array.from(scanner.values()), resolveNft, onIt);
    onIt(scanner[scanner.length - 1]._id, true);
    console.log('updateKnowleageDb done');
}


/***/ }),

/***/ "./packages/pori-actions/src/lib/nftBodyPart.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseDnaToBodyPart = void 0;
function parseLegendary(e) {
    return {
        l_head: 0 < (1 & e) ? 1 : 0,
        l_face: 0 < (2 & e) ? 1 : 0,
        l_body: 0 < (4 & e) ? 1 : 0,
        l_arm: 0 < (8 & e) ? 1 : 0,
        l_accessory: 0 < (16 & e) ? 1 : 0,
        l_leg: 0 < (32 & e) ? 1 : 0,
        l_tail: 0 < (64 & e) ? 1 : 0,
    };
}
function parseDnaToBodyPart(e) {
    if (!/^[0-9A-Fa-f]{64}$/g.test(e))
        throw new Error('INVALID_DNA');
    const r = new RegExp('^(?<d_head_class>.{1})(?<d_head_type>.{1})(?<r1_head_class>.{1})(?<r1_head_type>.{1})(?<r2_head_class>.{1})(?<r2_head_type>.{1})(?<r3_head_class>.{1})(?<r3_head_type>.{1})(?<d_face_class>.{1})(?<d_face_type>.{1})(?<r1_face_class>.{1})(?<r1_face_type>.{1})(?<r2_face_class>.{1})(?<r2_face_type>.{1})(?<r3_face_class>.{1})(?<r3_face_type>.{1})(?<d_body_class>.{1})(?<d_body_type>.{1})(?<r1_body_class>.{1})(?<r1_body_type>.{1})(?<r2_body_class>.{1})(?<r2_body_type>.{1})(?<r3_body_class>.{1})(?<r3_body_type>.{1})(?<d_arm_class>.{1})(?<d_arm_type>.{1})(?<r1_arm_class>.{1})(?<r1_arm_type>.{1})(?<r2_arm_class>.{1})(?<r2_arm_type>.{1})(?<r3_arm_class>.{1})(?<r3_arm_type>.{1})(?<d_accessory_class>.{1})(?<d_accessory_type>.{1})(?<r1_accessory_class>.{1})(?<r1_accessory_type>.{1})(?<r2_accessory_class>.{1})(?<r2_accessory_type>.{1})(?<r3_accessory_class>.{1})(?<r3_accessory_type>.{1})(?<d_leg_class>.{1})(?<d_leg_type>.{1})(?<r1_leg_class>.{1})(?<r1_leg_type>.{1})(?<r2_leg_class>.{1})(?<r2_leg_type>.{1})(?<r3_leg_class>.{1})(?<r3_leg_type>.{1})(?<d_tail_class>.{1})(?<d_tail_type>.{1})(?<r1_tail_class>.{1})(?<r1_tail_type>.{1})(?<r2_tail_class>.{1})(?<r2_tail_type>.{1})(?<r3_tail_class>.{1})(?<r3_tail_type>.{1})(?<legendary>.{2})(?<reserved>.{6})$'), t = e.match(r), a = t.groups;
    (a.legendary = Number('0x' + a.legendary)),
        (e = parseLegendary(a.legendary)),
        (a.l_head = e.l_head),
        (a.l_face = e.l_face),
        (a.l_body = e.l_body),
        (a.l_arm = e.l_arm),
        (a.l_accessory = e.l_accessory),
        (a.l_leg = e.l_leg),
        (a.l_tail = e.l_tail),
        (a.species_type = Number('0x' + a.d_head_class)),
        (a.reserved = Number('0x' + a.reserved)),
        (a.d_head_class = Number('0x' + a.d_head_class)),
        (a.d_head_type = Number('0x' + a.d_head_type)),
        (a.r1_head_class = Number('0x' + a.r1_head_class)),
        (a.r1_head_type = Number('0x' + a.r1_head_type)),
        (a.r2_head_class = Number('0x' + a.r2_head_class)),
        (a.r2_head_type = Number('0x' + a.r2_head_type)),
        (a.r3_head_class = Number('0x' + a.r3_head_class)),
        (a.r3_head_type = Number('0x' + a.r3_head_type)),
        (a.d_face_class = Number('0x' + a.d_face_class)),
        (a.d_face_type = Number('0x' + a.d_face_type)),
        (a.r1_face_class = Number('0x' + a.r1_face_class)),
        (a.r1_face_type = Number('0x' + a.r1_face_type)),
        (a.r2_face_class = Number('0x' + a.r2_face_class)),
        (a.r2_face_type = Number('0x' + a.r2_face_type)),
        (a.r3_face_class = Number('0x' + a.r3_face_class)),
        (a.r3_face_type = Number('0x' + a.r3_face_type)),
        (a.d_body_class = Number('0x' + a.d_body_class)),
        (a.d_body_type = Number('0x' + a.d_body_type)),
        (a.r1_body_class = Number('0x' + a.r1_body_class)),
        (a.r1_body_type = Number('0x' + a.r1_body_type)),
        (a.r2_body_class = Number('0x' + a.r2_body_class)),
        (a.r2_body_type = Number('0x' + a.r2_body_type)),
        (a.r3_body_class = Number('0x' + a.r3_body_class)),
        (a.r3_body_type = Number('0x' + a.r3_body_type)),
        (a.d_arm_class = Number('0x' + a.d_arm_class)),
        (a.d_arm_type = Number('0x' + a.d_arm_type)),
        (a.r1_arm_class = Number('0x' + a.r1_arm_class)),
        (a.r1_arm_type = Number('0x' + a.r1_arm_type)),
        (a.r2_arm_class = Number('0x' + a.r2_arm_class)),
        (a.r2_arm_type = Number('0x' + a.r2_arm_type)),
        (a.r3_arm_class = Number('0x' + a.r3_arm_class)),
        (a.r3_arm_type = Number('0x' + a.r3_arm_type)),
        (a.d_accessory_class = Number('0x' + a.d_accessory_class)),
        (a.d_accessory_type = Number('0x' + a.d_accessory_type)),
        (a.r1_accessory_class = Number('0x' + a.r1_accessory_class)),
        (a.r1_accessory_type = Number('0x' + a.r1_accessory_type)),
        (a.r2_accessory_class = Number('0x' + a.r2_accessory_class)),
        (a.r2_accessory_type = Number('0x' + a.r2_accessory_type)),
        (a.r3_accessory_class = Number('0x' + a.r3_accessory_class)),
        (a.r3_accessory_type = Number('0x' + a.r3_accessory_type)),
        (a.d_leg_class = Number('0x' + a.d_leg_class)),
        (a.d_leg_type = Number('0x' + a.d_leg_type)),
        (a.r1_leg_class = Number('0x' + a.r1_leg_class)),
        (a.r1_leg_type = Number('0x' + a.r1_leg_type)),
        (a.r2_leg_class = Number('0x' + a.r2_leg_class)),
        (a.r2_leg_type = Number('0x' + a.r2_leg_type)),
        (a.r3_leg_class = Number('0x' + a.r3_leg_class)),
        (a.r3_leg_type = Number('0x' + a.r3_leg_type)),
        (a.d_tail_class = Number('0x' + a.d_tail_class)),
        (a.d_tail_type = Number('0x' + a.d_tail_type)),
        (a.r1_tail_class = Number('0x' + a.r1_tail_class)),
        (a.r1_tail_type = Number('0x' + a.r1_tail_type)),
        (a.r2_tail_class = Number('0x' + a.r2_tail_class)),
        (a.r2_tail_type = Number('0x' + a.r2_tail_type)),
        (a.r3_tail_class = Number('0x' + a.r3_tail_class)),
        (a.r3_tail_type = Number('0x' + a.r3_tail_type)),
        (a.species_class = getClassName(a.species_type)),
        (a.d_head_type_name = getTypeName(a.d_head_class, a.d_head_type)),
        (a.d_face_type_name = getTypeName(a.d_face_class, a.d_face_type)),
        (a.d_body_type_name = getTypeName(a.d_body_class, a.d_body_type)),
        (a.d_arm_type_name = getTypeName(a.d_arm_class, a.d_arm_type)),
        (a.d_accessory_type_name = getTypeName(a.d_accessory_class, a.d_accessory_type)),
        (a.d_leg_type_name = getTypeName(a.d_leg_class, a.d_leg_type)),
        (a.d_tail_type_name = getTypeName(a.d_tail_class, a.d_tail_type)),
        (a.r1_head_type_name = getTypeName(a.r1_head_class, a.r1_head_type)),
        (a.r1_face_type_name = getTypeName(a.r1_face_class, a.r1_face_type)),
        (a.r1_body_type_name = getTypeName(a.r1_body_class, a.r1_body_type)),
        (a.r1_arm_type_name = getTypeName(a.r1_arm_class, a.r1_arm_type)),
        (a.r1_accessory_type_name = getTypeName(a.r1_accessory_class, a.r1_accessory_type)),
        (a.r1_leg_type_name = getTypeName(a.r1_leg_class, a.r1_leg_type)),
        (a.r1_tail_type_name = getTypeName(a.r1_tail_class, a.r1_tail_type)),
        (a.r2_head_type_name = getTypeName(a.r2_head_class, a.r2_head_type)),
        (a.r2_face_type_name = getTypeName(a.r2_face_class, a.r2_face_type)),
        (a.r2_body_type_name = getTypeName(a.r2_body_class, a.r2_body_type)),
        (a.r2_arm_type_name = getTypeName(a.r2_arm_class, a.r2_arm_type)),
        (a.r2_accessory_type_name = getTypeName(a.r2_accessory_class, a.r2_accessory_type)),
        (a.r2_leg_type_name = getTypeName(a.r2_leg_class, a.r2_leg_type)),
        (a.r2_tail_type_name = getTypeName(a.r2_tail_class, a.r2_tail_type)),
        (a.r3_head_type_name = getTypeName(a.r3_head_class, a.r3_head_type)),
        (a.r3_face_type_name = getTypeName(a.r3_face_class, a.r3_face_type)),
        (a.r3_body_type_name = getTypeName(a.r3_body_class, a.r3_body_type)),
        (a.r3_arm_type_name = getTypeName(a.r3_arm_class, a.r3_arm_type)),
        (a.r3_accessory_type_name = getTypeName(a.r3_accessory_class, a.r3_accessory_type)),
        (a.r3_leg_type_name = getTypeName(a.r3_leg_class, a.r3_leg_type)),
        (a.r3_tail_type_name = getTypeName(a.r3_tail_class, a.r3_tail_type));
    let s = 1;
    a.d_head_type == a.d_body_type && s++,
        a.d_face_type == a.d_body_type && s++,
        a.d_arm_type == a.d_body_type && s++,
        a.d_accessory_type == a.d_body_type && s++,
        a.d_leg_type == a.d_body_type && s++,
        a.d_tail_type == a.d_body_type && s++,
        (a.purity = s);
    return { ...a };
}
exports.parseDnaToBodyPart = parseDnaToBodyPart;
const t = new Map(), a = new Map(), s = new Map(), n = new Map(), _ = new Map(), c = new Map(), o = new Map();
t.set(1, 'Chickie'),
    t.set(2, 'Rampi'),
    t.set(3, 'Ri Kong'),
    t.set(4, 'Bruwan'),
    t.set(5, 'Calico'),
    t.set(6, 'Tiga'),
    t.set(7, 'Mama Puncha'),
    a.set(1, 'Doo Doo'),
    a.set(2, 'Lumin'),
    a.set(3, 'Cancihalcon'),
    a.set(4, 'Nimo'),
    a.set(5, 'Hoba'),
    a.set(6, 'OctoHook'),
    a.set(7, 'Blowish'),
    s.set(1, 'Knowizall'),
    s.set(2, 'Veneno'),
    s.set(3, 'Wipe Genie'),
    s.set(4, 'Apollyon'),
    s.set(5, 'Frankender'),
    s.set(6, 'Fio'),
    s.set(7, 'Hocori'),
    _.set(1, 'Willy Wheel'),
    _.set(2, 'Drilla '),
    _.set(3, 'Monica'),
    _.set(4, 'Zeta'),
    _.set(5, 'Sami'),
    _.set(6, 'Gampo'),
    _.set(7, 'Carry'),
    _.set(1, 'Pozilla'),
    _.set(2, 'Poceratop'),
    _.set(3, 'Dinoxic'),
    _.set(4, 'Pobarrian'),
    _.set(5, 'Calepis '),
    _.set(6, 'Teelop'),
    _.set(7, 'Wyvo'),
    c.set(1, 'Sig Sar'),
    c.set(2, 'Brotopo'),
    c.set(3, 'Pizzalien'),
    c.set(4, 'Gree'),
    c.set(5, 'Tototaco'),
    c.set(6, 'Rupa'),
    c.set(7, 'Trippy'),
    o.set(1, 'Mysteria 1'),
    o.set(2, 'Mysteria 2'),
    o.set(3, 'Mysteria 3'),
    o.set(4, 'Mysteria 4'),
    o.set(5, 'Mysteria 5'),
    o.set(6, 'Mysteria 6'),
    o.set(7, 'Mysteria 7');
const l = new Map();
l.set(1, {
    name: 'Terra',
    typeNames: t,
});
l.set(2, {
    name: 'Aqua',
    typeNames: a,
});
l.set(3, {
    name: 'Magica',
    typeNames: s,
});
l.set(4, {
    name: 'Mecha',
    typeNames: n,
});
l.set(5, {
    name: 'Ancia',
    typeNames: _,
});
l.set(6, {
    name: 'Stella',
    typeNames: c,
});
l.set(7, {
    name: 'Mysteria',
    typeNames: o,
});
function getClassName(e) {
    return l.has(e) ? l.get(e).name : null;
}
function getTypeName(r, t) {
    if (l.has(r)) {
        const e = l.get(r).typeNames;
        if (e.has(t))
            return e.get(t);
    }
    return null;
}


/***/ }),

/***/ "./packages/pori-actions/src/lib/queryPoriApi.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.queryMarketItems = exports.expandEngadedMission = exports.queryMarketInfo = exports.queryNftInfo = void 0;
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const pori_metadata_2 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const adventure_1 = __webpack_require__("./packages/pori-actions/src/lib/adventure.ts");
const web3utils_1 = __webpack_require__("./packages/pori-actions/src/lib/util/web3utils.ts");
async function queryNftInfo(id, ctx = {
    env: pori_metadata_2.ENV.Staging,
}) {
    const baseURL = (0, pori_metadata_1.getAPILink)(ctx.env);
    const res = await utils_1.axiosIns.request({
        method: 'get',
        baseURL,
        url: `/api/v1/assets/${id}`,
    });
    if (res.status !== 200)
        throw new Error(`Request failed status ${res.status} - ${res.data}`);
    const data = JSON.parse(res.data);
    data.ownerAddress = (0, web3utils_1.toChecksumAddress)(data.ownerAddress);
    return data;
}
exports.queryNftInfo = queryNftInfo;
async function queryMarketInfo({ ctx, }) {
    // https://api.poriverse.io/api/v1/assets
    var _a;
    const baseURL = (0, pori_metadata_1.getAPILink)(ctx.env);
    const res = await utils_1.axiosIns.request({
        method: 'get',
        baseURL,
        url: `/api/v1/assets`,
        params: {
            status: '1',
            pageIndex: '0',
            pageSize: '35',
            sortBy: 'price',
            sortOrder: 'asc',
            minPrice: '0',
            maxPrice: '99000000',
            minNumOfBreeds: '0',
            maxNumOfBreeds: '5',
            minLegend: '0',
            maxLegend: '7',
            minMinePower: '0',
            maxMinePower: '500',
            minHelpPower: '0',
            maxHelpPower: '500',
            stage: '',
            type: '',
            poriClass: '',
            keyword: '',
        },
    });
    if (res.status !== 200)
        throw new Error(`Request failed status ${res.status} - ${res.data}`);
    const data = (((_a = JSON.parse(res.data)) === null || _a === void 0 ? void 0 : _a.items) || []);
    return data;
}
exports.queryMarketInfo = queryMarketInfo;
async function expandEngadedMission({ ctx, data, }) {
    return Promise.all(data.map(async (itm) => {
        const engagedMission = await (0, adventure_1.queryMissiontOfPoriSc)(ctx, itm.tokenId);
        return {
            ...itm,
            engagedMission: engagedMission,
        };
    }));
}
exports.expandEngadedMission = expandEngadedMission;
// ------------
async function queryMarketItems({ ctx, pageSize = 10, }) {
    var _a;
    const baseURL = (0, pori_metadata_1.getAPILink)(ctx.env);
    const res = await utils_1.axiosIns.request({
        method: 'get',
        baseURL,
        url: `/api/v1/item-orders`,
        params: {
            pageIndex: 0,
            pageSize,
            sortBy: 'unitPrice',
            sortOrder: 'asc',
            minPrice: 0,
            maxPrice: 99000000,
        },
    });
    if (res.status !== 200)
        throw new Error(`Request failed status ${res.status} - ${res.data}`);
    const data = (((_a = JSON.parse(res.data)) === null || _a === void 0 ? void 0 : _a.items) || []);
    return data;
}
exports.queryMarketItems = queryMarketItems;


/***/ }),

/***/ "./packages/pori-actions/src/lib/startStop.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.close = exports.init = void 0;
const tslib_1 = __webpack_require__("tslib");
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const stream_1 = __webpack_require__("stream");
const web3_1 = tslib_1.__importDefault(__webpack_require__("web3"));
async function init(env) {
    const uriws = (0, pori_metadata_1.getWeb3NodeUri)(env);
    const urihttp = (0, pori_metadata_1.getWeb3NodeUriHttp)(env);
    if (!uriws && !urihttp) {
        console.error(`missing env NODE_URI_${env} or NODE_URI_${env}_HTTP`);
        process.exit(1);
    }
    const provider = uriws
        ? new web3_1.default.providers.WebsocketProvider(uriws)
        : new web3_1.default.providers.HttpProvider(urihttp);
    console.log('use web3 provider', provider instanceof web3_1.default.providers.WebsocketProvider ? 'wss' : 'http');
    const web3 = new web3_1.default(provider);
    const idleGameSc = (0, pori_metadata_1.getIdleGameAddressSC)(env);
    const portalSc = (0, pori_metadata_1.getPortalAddressSC)(env);
    if (!portalSc)
        throw new Error('missing portal sc config');
    const contract = new web3.eth.Contract(idleGameSc.abi, idleGameSc.address);
    const contractPortal = new web3.eth.Contract(portalSc.abi, portalSc.address);
    const { setting, custom } = (0, pori_metadata_1.getContextSetting)(env);
    const ctx = {
        contract,
        contractPortal,
        web3,
        provider,
        env,
        emiter: new stream_1.EventEmitter(),
        ui: {
            writeMessage: async (msg) => console.log(msg),
            editMessage: async (lastMsginfo, msg) => {
                /*nothing*/
            },
        },
        setting: setting,
        custom: custom,
    };
    return ctx;
}
exports.init = init;
async function close(ctx) {
    ctx.provider.disconnect();
}
exports.close = close;


/***/ }),

/***/ "./packages/pori-actions/src/lib/transformer/transformIdleGameEvent2Database.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transformIdleGameEvent2Database = void 0;
const tslib_1 = __webpack_require__("tslib");
const Repos = tslib_1.__importStar(__webpack_require__("./packages/pori-repositories/src/index.ts"));
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
async function transformIdleGameEvent2Database(realm, events, resolveNftInfo, onIt) {
    for (const it of events) {
        switch (it.type) {
            case pori_metadata_1.IdleGameSc.EIdleGameSCEventType.PorianDeposited:
                {
                    const data = it.data;
                    const playerId = data.from;
                    const poriId = data.porian;
                    let nftInfo;
                    const poriObj = await Repos.PoriRepo.findOne(realm, poriId);
                    // resolve api query only for new nft
                    if (!poriObj)
                        nftInfo = await resolveNftInfo(poriId);
                    Repos.PlayerRepo.txSync(realm, () => {
                        const playerObj = Repos.PlayerRepo.getOrCreate(realm, playerId, Repos.PlayerDataModel.generate(playerId, it.blockNo));
                        const poriObj = Repos.PoriRepo.getOrCreate(realm, poriId, nftInfo ? Repos.PoriDataModel.generate(nftInfo) : {});
                        // active + add to player inventories
                        poriObj.isActive = true;
                        const isExists = playerObj.pories.findIndex((itm) => itm._id === poriId) >= 0;
                        if (!isExists)
                            playerObj.pories.push(poriObj);
                    });
                }
                break;
            case pori_metadata_1.IdleGameSc.EIdleGameSCEventType.PorianWithdrawed:
                {
                    const data = it.data;
                    const playerId = data.to;
                    const poriId = data.porian;
                    const playerObj = await Repos.PlayerRepo.findOne(realm, playerId);
                    const poriObj = await Repos.PoriRepo.findOne(realm, poriId);
                    if (!playerObj)
                        break;
                    Repos.PlayerRepo.txSync(realm, () => {
                        // deactive + remove from player inventories
                        if (poriObj)
                            poriObj.isActive = false;
                        const isExists = playerObj.pories.findIndex((itm) => itm._id === poriId) >= 0;
                        if (isExists) {
                            playerObj.pories = playerObj.pories.filter((itm) => itm._id !== poriId);
                        }
                    });
                }
                break;
            case pori_metadata_1.IdleGameSc.EIdleGameSCEventType.GameDurationChanged:
                {
                    const data = it.data;
                    const metadata = await Repos.IdleGameSCMetadataRepo.findOne(realm, 'default');
                    if (!metadata)
                        break;
                    Repos.IdleGameSCMetadataRepo.txSync(realm, () => {
                        metadata.extras['turnDuration'] = data.turnDuration;
                        metadata.extras['adventureDuration'] = data.adventureDuration;
                    });
                }
                break;
            default:
                break;
        }
        onIt && onIt(it._id);
    }
}
exports.transformIdleGameEvent2Database = transformIdleGameEvent2Database;


/***/ }),

/***/ "./packages/pori-actions/src/lib/util/web3utils.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toChecksumAddress = exports.functionSignature = void 0;
const tslib_1 = __webpack_require__("tslib");
const web3_1 = tslib_1.__importDefault(__webpack_require__("web3"));
const web3 = new web3_1.default();
function functionSignature(inp) {
    return web3.eth.abi.encodeFunctionSignature(inp);
}
exports.functionSignature = functionSignature;
function toChecksumAddress(inp) {
    return web3.utils.toChecksumAddress(inp);
}
exports.toChecksumAddress = toChecksumAddress;


/***/ }),

/***/ "./packages/pori-actions/src/lib/wallet/balance.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMaticBalance = exports.getTokenBalance = void 0;
const minABI = [
    // balanceOf
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
    },
];
const contractForTokenCache = {};
async function getTokenBalance({ ctx, erc20Address, walletAddress, }) {
    let contract = contractForTokenCache[erc20Address];
    if (!contract) {
        contract = new ctx.web3.eth.Contract(minABI, erc20Address);
        contractForTokenCache[erc20Address] = contract;
    }
    const res = await contract.methods.balanceOf(walletAddress).call();
    return parseInt(res) / 10 ** 18;
}
exports.getTokenBalance = getTokenBalance;
async function getMaticBalance({ ctx, walletAddress, }) {
    const balanceInWei = await ctx.web3.eth.getBalance(walletAddress);
    return +ctx.web3.utils.fromWei(balanceInWei);
}
exports.getMaticBalance = getMaticBalance;


/***/ }),

/***/ "./packages/pori-actions/src/lib/wallet/walletConnect.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addWalletConnectToContext = void 0;
const tslib_1 = __webpack_require__("tslib");
const client_1 = tslib_1.__importDefault(__webpack_require__("@walletconnect/client"));
const qrcode_modal_1 = tslib_1.__importDefault(__webpack_require__("@walletconnect/qrcode-modal"));
const fs_1 = __webpack_require__("fs");
class MySessionStorage {
    constructor(storagePath) {
        console.log('MySessionStorage new', storagePath);
        this.storageId = storagePath;
    }
    getSession() {
        if (this.storageId) {
            if ((0, fs_1.existsSync)(this.storageId)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.storageId).toString());
                return data;
            }
        }
        return null;
    }
    setSession(session) {
        if (this.storageId)
            (0, fs_1.writeFileSync)(this.storageId, JSON.stringify(session));
        return session;
    }
    removeSession() {
        if (this.storageId)
            (0, fs_1.unlinkSync)(this.storageId);
    }
}
async function addWalletConnectToContext(ctx, sessionStoragePath) {
    const storage = new MySessionStorage(sessionStoragePath);
    const connector = new client_1.default({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: qrcode_modal_1.default,
        session: storage.getSession(),
        clientMeta: {
            description: 'Pori-Poc',
            url: 'https://nodejs.org/en/',
            icons: ['https://nodejs.org/static/images/logo.svg'],
            name: 'Pori-Poc',
        },
    });
    // injected hack b/c in version 1.8.x - typedef is wrong
    connector._sessionStorage = storage;
    ctx.walletConnectChannel = connector;
    // Check if connection is already established
    if (!connector.connected) {
        // create new session
        connector.createSession({ chainId: 137 });
    }
    // Subscribe to connection events
    connector.on('connect', (error, payload) => {
        if (error) {
            throw error;
        }
        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.info('wallet connect channel connected', { accounts, chainId });
    });
    connector.on('session_update', (error, payload) => {
        if (error) {
            throw error;
        }
        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.info('wallet connect channel session updated', {
            accounts,
            chainId,
        });
    });
    connector.on('disconnect', (error, payload) => {
        if (error) {
            throw error;
        }
        console.info('wallet connect channel disconnected', { error, payload });
        // Delete connector
    });
}
exports.addWalletConnectToContext = addWalletConnectToContext;


/***/ }),

/***/ "./packages/pori-actions/src/lib/wallet/web3Action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.monitorTx = exports.currentGasPrice = exports.sendSignRequestForWalletConnectTx = exports.sendRequestForWalletConnectTx = void 0;
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const lodash_1 = __webpack_require__("lodash");
const index_1 = __webpack_require__("./packages/pori-actions/src/index.ts");
const sendTxJobQueue = new utils_1.JobQueue();
function sendRequestForWalletConnectTx({ ctx }, tx, onTxReceipt) {
    return sendTxJobQueue.addJob(async () => {
        return useAccountToSendTx(ctx, tx, onTxReceipt);
    });
}
exports.sendRequestForWalletConnectTx = sendRequestForWalletConnectTx;
async function useAccountToSendTx(ctx, tx, onTxReceipt) {
    var _a;
    if (!ctx.walletAcc)
        return;
    const gasFactor = (_a = ctx.setting.gasFactor) !== null && _a !== void 0 ? _a : 1;
    const defaultWeb3GasPrice = await currentGasPrice({ ctx });
    const defaultNonce = await ctx.web3.eth.getTransactionCount(ctx.walletAcc.address);
    const baseGas = Math.round(+defaultWeb3GasPrice * gasFactor);
    if (!tx.gasPrice && gasFactor !== 1) {
        await ctx.ui.writeMessage(`warning: with gasFactor = ${gasFactor}. total gas price = ${baseGas}`);
    }
    const web3Tx = {
        from: ctx.walletAcc.address,
        to: tx.to,
        data: tx.data,
        gas: tx.gas || '2000000',
        gasPrice: tx.gasPrice || baseGas,
        nonce: tx.nonce ? parseInt(tx.nonce.toString()) : defaultNonce,
    };
    const signedTx = await ctx.walletAcc.signTransaction(web3Tx);
    if (signedTx.rawTransaction) {
        const txInfo = ctx.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        txInfo.on('receipt', (r) => onTxReceipt && onTxReceipt(r));
        return (await txInfo).transactionHash;
    }
    return;
}
function sendSignRequestForWalletConnectTx({ ctx }, tx) {
    return useAccountToSignTx(ctx, tx);
}
exports.sendSignRequestForWalletConnectTx = sendSignRequestForWalletConnectTx;
async function useAccountToSignTx(ctx, tx) {
    if (!ctx.walletAcc)
        return;
    const defaultWeb3GasPrice = await index_1.WalletActions.currentGasPrice({ ctx });
    const defaultNonce = await ctx.web3.eth.getTransactionCount(ctx.walletAcc.address);
    const web3Tx = {
        from: ctx.walletAcc.address,
        to: tx.to,
        data: tx.data,
        gas: tx.gas || '600000',
        gasPrice: tx.gasPrice || defaultWeb3GasPrice,
        nonce: tx.nonce ? parseInt(tx.nonce.toString()) : defaultNonce,
    };
    const signedTx = await ctx.walletAcc.signTransaction(web3Tx);
    if (signedTx.rawTransaction) {
        return signedTx.rawTransaction.split('0x')[1];
    }
    return signedTx.rawTransaction;
}
async function currentGasPrice({ ctx }) {
    if ((0, lodash_1.isFunction)(ctx.custom.estimageGas))
        return await ctx.custom.estimageGas(ctx);
    return await ctx.web3.eth.getGasPrice();
}
exports.currentGasPrice = currentGasPrice;
const TIME_4_HOUR_MS = 4 * 60 * 60 * 1000;
async function monitorTx({ ctx, txHash, timeoutMs = TIME_4_HOUR_MS, }) {
    let shouldRun = true;
    const sleepTimeoutMs = 30 * 1000; // 30 sec
    const now = Date.now();
    const endAt = timeoutMs + now;
    while (shouldRun) {
        const info = await ctx.web3.eth.getTransactionReceipt(txHash);
        // not found receipt -> wrong tx
        if (!info)
            return false;
        // tx mined
        if (info.blockNumber && info.status) {
            return true;
        }
        // continue waiting
        await (0, utils_1.waitForMs)(sleepTimeoutMs);
        shouldRun = Date.now() > endAt;
    }
    return false;
}
exports.monitorTx = monitorTx;


/***/ }),

/***/ "./packages/pori-actions/src/lib/workflow/workflowV1.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createWorkflow = void 0;
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
function createWorkflow(exec, id) {
    const cancelDefered = new utils_1.Deferred();
    const finishDefered = new utils_1.Deferred();
    const state = {
        id: id !== null && id !== void 0 ? id : `workflow_simple_${Date.now()}`,
        startAt: new Date(),
        data: {},
        currentStep: '0',
        finishDefered,
        abort: () => cancelDefered.reject && cancelDefered.reject(new Error('aborted')),
        start: () => {
            doJob();
            return finishDefered.promise;
        },
        updateState: (func) => {
            func();
            state.onChange && state.onChange(state);
        },
        promiseWithAbort: (p) => Promise.race([p, cancelDefered.promise]),
    };
    const doJob = async () => {
        try {
            await exec(state);
            state.updateState(() => {
                state.finishAt = new Date();
            });
            finishDefered.resolve(null);
        }
        catch (error) {
            state.updateState(() => {
                state.error = error;
            });
            finishDefered.reject(error);
        }
    };
    return state;
}
exports.createWorkflow = createWorkflow;


/***/ }),

/***/ "./packages/pori-metadata/src/commonTypes.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ENV = void 0;
var ENV;
(function (ENV) {
    ENV["Staging"] = "STAG";
    ENV["Prod"] = "PROD";
    ENV["ProdPorichain"] = "PROD_PORICHAIN";
})(ENV = exports.ENV || (exports.ENV = {}));


/***/ }),

/***/ "./packages/pori-metadata/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdleGameSc = exports.getDatastoreBackupKey = exports.getChainExplorerTxHashLink = exports.getMobileWalletApplink = exports.getContextSetting = exports.calculateMineTurnTime = exports.getPortalAddressSC = exports.getIdleGameAddressSC = exports.getMarketplayBaseLink = exports.getAdventureBaseLink = exports.getRIKENTokenInfo = exports.getRIKENTokenInfoOnPolygon = exports.getRIGYTokenInfo = exports.getRIGYTokenInfoOnPolygon = exports.getKyberSwapFactoryAddress = exports.getAPILink = exports.getWeb3NodeUriPolygonHttp = exports.getWeb3NodeUriHttp = exports.getWeb3NodeUri = exports.TURN_DURATION_SEC = exports.TEN_POWER_10_BN = exports.TEN_POWER_10 = void 0;
const tslib_1 = __webpack_require__("tslib");
const commonTypes_1 = __webpack_require__("./packages/pori-metadata/src/commonTypes.ts");
const stagConfig = tslib_1.__importStar(__webpack_require__("./packages/pori-metadata/src/lib/sta-poriverse_info.ts"));
const prodConfig = tslib_1.__importStar(__webpack_require__("./packages/pori-metadata/src/lib/prod-poriverse_info.ts"));
const prodPoriChainConfig = tslib_1.__importStar(__webpack_require__("./packages/pori-metadata/src/lib/prod-porichain-poriverse_info.ts"));
const lodash_1 = __webpack_require__("lodash");
exports.TEN_POWER_10 = 10 ** 18;
exports.TEN_POWER_10_BN = BigInt(10 ** 18);
exports.TURN_DURATION_SEC = 1800;
function getWeb3NodeUri(env) {
    const key = `NODE_URI_${env}`.toUpperCase();
    return process.env[key];
}
exports.getWeb3NodeUri = getWeb3NodeUri;
function getWeb3NodeUriHttp(env) {
    const key = `NODE_URI_${env}_HTTP`.toUpperCase();
    return process.env[key];
}
exports.getWeb3NodeUriHttp = getWeb3NodeUriHttp;
function getWeb3NodeUriPolygonHttp() {
    const key = `NODE_URI_${commonTypes_1.ENV.Prod}_HTTP`.toUpperCase();
    return process.env[key];
}
exports.getWeb3NodeUriPolygonHttp = getWeb3NodeUriPolygonHttp;
function getAPILink(env) {
    if (env === commonTypes_1.ENV.Staging)
        return stagConfig.gameInfo.m.app.apiUrl;
    else if (env === commonTypes_1.ENV.ProdPorichain)
        return prodPoriChainConfig.gameInfo.m.app.apiUrl;
    else
        return prodConfig.gameInfo.m.app.apiUrl;
}
exports.getAPILink = getAPILink;
function getKyberSwapFactoryAddress(env) {
    // https://docs.kyberswap.com/developer-guides/kyberswap-addresses#mainnet
    if (env === commonTypes_1.ENV.Staging)
        return '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453';
    return '0x5f1fe642060b5b9658c15721ea22e982643c095c';
}
exports.getKyberSwapFactoryAddress = getKyberSwapFactoryAddress;
function getRIGYTokenInfoOnPolygon() {
    const tokenConfig = prodConfig.gameInfo.m.app;
    return {
        symbol: tokenConfig.token.inGameSymbol,
        tokenAddress: tokenConfig.token.inGameAddress,
        decimal: tokenConfig.token.inGameDecimal,
        chainId: tokenConfig.rpcMetamask.chainId,
    };
}
exports.getRIGYTokenInfoOnPolygon = getRIGYTokenInfoOnPolygon;
function getRIGYTokenInfo(env) {
    let tokenConfig = prodConfig.gameInfo.m.app;
    if (env === commonTypes_1.ENV.Staging) {
        tokenConfig = stagConfig.gameInfo.m.app;
    }
    else if (env === commonTypes_1.ENV.ProdPorichain)
        tokenConfig = prodPoriChainConfig.gameInfo.m.app;
    return {
        symbol: tokenConfig.token.inGameSymbol,
        tokenAddress: tokenConfig.token.inGameAddress,
        decimal: tokenConfig.token.inGameDecimal,
        chainId: tokenConfig.rpcMetamask.chainId,
    };
}
exports.getRIGYTokenInfo = getRIGYTokenInfo;
function getRIKENTokenInfoOnPolygon() {
    const tokenConfig = prodConfig.gameInfo.m.app;
    return {
        symbol: tokenConfig.token.nativeSymbol,
        tokenAddress: tokenConfig.token.nativeAddress,
        decimal: tokenConfig.token.nativeDecimal,
        chainId: tokenConfig.rpcMetamask.chainId,
    };
}
exports.getRIKENTokenInfoOnPolygon = getRIKENTokenInfoOnPolygon;
function getRIKENTokenInfo(env) {
    let tokenConfig = prodConfig.gameInfo.m.app;
    if (env === commonTypes_1.ENV.Staging) {
        tokenConfig = stagConfig.gameInfo.m.app;
    }
    else if (env === commonTypes_1.ENV.ProdPorichain)
        tokenConfig = prodPoriChainConfig.gameInfo.m.app;
    return {
        symbol: tokenConfig.token.nativeSymbol,
        tokenAddress: tokenConfig.token.nativeAddress,
        decimal: tokenConfig.token.nativeDecimal,
        chainId: tokenConfig.rpcMetamask.chainId,
    };
}
exports.getRIKENTokenInfo = getRIKENTokenInfo;
function getAdventureBaseLink(env) {
    if (env === commonTypes_1.ENV.Staging)
        return stagConfig.gameInfo.m.app.urlAdventure;
    else if (env === commonTypes_1.ENV.ProdPorichain)
        return prodPoriChainConfig.gameInfo.m.app.urlAdventure;
    return prodConfig.gameInfo.m.app.urlAdventure;
}
exports.getAdventureBaseLink = getAdventureBaseLink;
function getMarketplayBaseLink(env) {
    if (env === commonTypes_1.ENV.Staging)
        return stagConfig.gameInfo.m.app.urlMarketplace;
    else if (env === commonTypes_1.ENV.ProdPorichain)
        return prodPoriChainConfig.gameInfo.m.app.urlMarketplace;
    return prodConfig.gameInfo.m.app.urlMarketplace;
}
exports.getMarketplayBaseLink = getMarketplayBaseLink;
function getIdleGameAddressSC(env) {
    if (env === commonTypes_1.ENV.Staging) {
        return {
            abi: stagConfig.ABI_IDLE,
            address: stagConfig.gameInfo.m.app.contractAddress.idleGameAddress,
            createdBlock: stagConfig.gameInfo.m.app.scCreatedBlock.idle,
        };
    }
    else if (env === commonTypes_1.ENV.ProdPorichain)
        return {
            abi: prodPoriChainConfig.ABI_IDLE,
            address: prodPoriChainConfig.gameInfo.m.app.contractAddress.idleGameAddress,
            createdBlock: prodPoriChainConfig.gameInfo.m.app.scCreatedBlock.idle,
        };
    return {
        abi: prodConfig.ABI_IDLE,
        address: prodConfig.gameInfo.m.app.contractAddress.idleGameAddress,
        createdBlock: prodConfig.gameInfo.m.app.scCreatedBlock.idle,
    };
}
exports.getIdleGameAddressSC = getIdleGameAddressSC;
function getPortalAddressSC(env) {
    if (env === commonTypes_1.ENV.ProdPorichain)
        return {
            abi: prodPoriChainConfig.ABI_PORTAL,
            address: prodPoriChainConfig.gameInfo.m.app.contractAddress.rainbowPortal,
        };
    return null;
}
exports.getPortalAddressSC = getPortalAddressSC;
function calculateMineTurnTime(startTime) {
    const farmerAtkStartAt = new Date(startTime.valueOf() + exports.TURN_DURATION_SEC * 1000);
    const supporterAtkStartAt = new Date(startTime.valueOf() + exports.TURN_DURATION_SEC * 2 * 1000);
    return {
        farmerAtkStartAt,
        supporterAtkStartAt,
    };
}
exports.calculateMineTurnTime = calculateMineTurnTime;
function getContextSetting(env) {
    // getGas porichain return as 500. But avg fee on chain around 4100
    const gasFactor = 1;
    const safeGweith = env === commonTypes_1.ENV.ProdPorichain ? 5000 : 80;
    const autoPlayMicroDelayMs = env === commonTypes_1.ENV.ProdPorichain ? 10000 : 3000;
    // custom estimage gas function base on pending tx for porichain
    let estimageGas;
    if (env === commonTypes_1.ENV.ProdPorichain) {
        estimageGas = async (ctx) => {
            const blockInfo = await ctx.web3.eth.getBlock('latest');
            const pendingTx = await Promise.all(blockInfo.transactions.map((itm) => ctx.web3.eth.getTransaction(itm)));
            if ((0, lodash_1.isEmpty)(pendingTx))
                return ctx.web3.utils.toWei('5000', 'gwei');
            const avgGas = (0, lodash_1.mean)(pendingTx
                .filter((itm) => +itm.gasPrice > 0)
                .map((itm) => {
                return +itm.gasPrice;
            }));
            return Math.round(avgGas).toString();
        };
    }
    return {
        setting: { gasFactor, safeGweith, autoPlayMicroDelayMs },
        custom: {
            estimageGas,
        },
    };
}
exports.getContextSetting = getContextSetting;
function getMobileWalletApplink(env, link) {
    if (env === commonTypes_1.ENV.ProdPorichain) {
        const linkWithoutHttps = link.split('https://')[1];
        return `https://metamask.app.link/dapp/${linkWithoutHttps}`;
    }
    return `https://link.trustwallet.com/open_url?url=${link}&coin_id=966`;
}
exports.getMobileWalletApplink = getMobileWalletApplink;
function getChainExplorerTxHashLink(env, txHash) {
    if (env === commonTypes_1.ENV.ProdPorichain) {
        return `https://explorer.porichain.io/tx/${txHash}`;
    }
    return `https://polygonscan.com/tx/${txHash}`;
}
exports.getChainExplorerTxHashLink = getChainExplorerTxHashLink;
function getDatastoreBackupKey(env) {
    if (env === commonTypes_1.ENV.ProdPorichain)
        return 'porichain-db-realm';
    return 'pori-db-realm';
}
exports.getDatastoreBackupKey = getDatastoreBackupKey;
tslib_1.__exportStar(__webpack_require__("./packages/pori-metadata/src/commonTypes.ts"), exports);
exports.IdleGameSc = tslib_1.__importStar(__webpack_require__("./packages/pori-metadata/src/lib/idleGameSc/index.ts"));
tslib_1.__exportStar(__webpack_require__("./packages/pori-metadata/src/lib/idleGameSc/type.idleGame.ts"), exports);


/***/ }),

/***/ "./packages/pori-metadata/src/lib/idleGameSc/eventParser.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseIdleGameScEvent = void 0;
const tslib_1 = __webpack_require__("tslib");
const web3_1 = tslib_1.__importDefault(__webpack_require__("web3"));
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const type_idleGame_1 = __webpack_require__("./packages/pori-metadata/src/lib/idleGameSc/type.idleGame.ts");
function parseIdleGameScEvent(eventInfo) {
    // if (!AllIdleGameEvents.includes(eventInfo.event)) return null;
    let evType;
    let data;
    if (eventInfo.event)
        evType = eventInfo.event;
    else {
        const rawTopic = eventInfo.signature || eventInfo.raw.topics[0];
        evType = type_idleGame_1.IdleGameSCEventInvSignatureTable[rawTopic];
    }
    if (!evType)
        return null;
    switch (evType) {
        case type_idleGame_1.EIdleGameSCEventType.AdventureStarted:
            data = {
                mineId: (0, utils_1.toNumber)(eventInfo.returnValues['mineId']),
                farmer: eventInfo.returnValues['farmer'],
                startTime: (0, utils_1.toNumber)(eventInfo.returnValues['startTime']),
                blockedTime: (0, utils_1.toNumber)(eventInfo.returnValues['blockedTime']),
                porians: (0, utils_1.transformArrayElementToNumber)(eventInfo.returnValues['porians']),
                indexes: (0, utils_1.transformArrayElementToNumber)(eventInfo.returnValues['indexes']),
                rewardLevels: (0, utils_1.transformArrayElementToNumber)(eventInfo.returnValues['rewardLevels']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.AdventureFinished:
            data = {
                mineId: (0, utils_1.toNumber)(eventInfo.returnValues['mineId']),
                winner: eventInfo.returnValues['winner'],
                fragments: (0, utils_1.toNumber)(eventInfo.returnValues['fragments']),
                farmerReward1: (0, utils_1.toDecimal128)(eventInfo.returnValues['farmerReward1']),
                farmerReward2: (0, utils_1.toDecimal128)(eventInfo.returnValues['farmerReward2']),
                helperReward1: (0, utils_1.toDecimal128)(eventInfo.returnValues['helperReward1']),
                helperReward2: (0, utils_1.toDecimal128)(eventInfo.returnValues['helperReward2']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.AdventureFortified:
            data = {
                mineId: (0, utils_1.toNumber)(eventInfo.returnValues['mineId']),
                porian: (0, utils_1.toNumber)(eventInfo.returnValues['porian']),
                index: (0, utils_1.toNumber)(eventInfo.returnValues['index']),
                rewardLevel: (0, utils_1.toNumber)(eventInfo.returnValues['rewardLevel']),
                blockedTime: (0, utils_1.toNumber)(eventInfo.returnValues['blockedTime']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.AdventureSupported1:
            data = {
                mineId: (0, utils_1.toNumber)(eventInfo.returnValues['mineId']),
                helper: eventInfo.returnValues['helper'],
                porians: (0, utils_1.transformArrayElementToNumber)(eventInfo.returnValues['porians']),
                indexes: (0, utils_1.transformArrayElementToNumber)(eventInfo.returnValues['indexes']),
                rewardLevels: (0, utils_1.transformArrayElementToNumber)(eventInfo.returnValues['rewardLevels']),
                blockedTime: (0, utils_1.toNumber)(eventInfo.returnValues['blockedTime']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.AdventureSupported2:
            data = {
                mineId: (0, utils_1.toNumber)(eventInfo.returnValues['mineId']),
                porian: (0, utils_1.toNumber)(eventInfo.returnValues['porian']),
                index: (0, utils_1.toNumber)(eventInfo.returnValues['index']),
                rewardLevel: (0, utils_1.toNumber)(eventInfo.returnValues['rewardLevel']),
                blockedTime: (0, utils_1.toNumber)(eventInfo.returnValues['blockedTime']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.PorianDeposited:
            data = {
                from: eventInfo.returnValues['from'],
                porian: (0, utils_1.toNumber)(eventInfo.returnValues['porian']),
                expiredAt: (0, utils_1.toNumber)(eventInfo.returnValues['expiredAt']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.PorianWithdrawed:
            data = {
                to: eventInfo.returnValues['to'],
                porian: (0, utils_1.toNumber)(eventInfo.returnValues['porian']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.GameDurationChanged:
            data = {
                adventureDuration: (0, utils_1.toNumber)(eventInfo.returnValues['adventureDuration']),
                turnDuration: (0, utils_1.toNumber)(eventInfo.returnValues['turnDuration']),
            };
            break;
        case type_idleGame_1.EIdleGameSCEventType.SBattleSwapped:
            data = parseSBattleSwapRawData(eventInfo.raw.data);
            break;
    }
    return {
        type: evType,
        txHash: eventInfo.transactionHash,
        blockNo: eventInfo.blockNumber,
        data,
    };
}
exports.parseIdleGameScEvent = parseIdleGameScEvent;
function parseSBattleSwapRawData(rawData) {
    const tmp = (0, utils_1.splitPackedHexBy32Bytes)(rawData);
    const mineId = parseInt(tmp[0], 16);
    const address = web3_1.default.utils.toChecksumAddress(`0x${tmp[1].slice(24, tmp[1].length)}`);
    const porianOutside = parseInt(tmp[2], 16);
    const porianInside = parseInt(tmp[3], 16);
    const fromIndex = parseInt(tmp[4], 16);
    const toIndex = parseInt(tmp[5], 16);
    return {
        mineId,
        farmer: address,
        porians: [porianOutside, porianInside],
        from: fromIndex.toString(),
        to: toIndex.toString(),
    };
}


/***/ }),

/***/ "./packages/pori-metadata/src/lib/idleGameSc/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./packages/pori-metadata/src/lib/idleGameSc/eventParser.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-metadata/src/lib/idleGameSc/type.idleGame.ts"), exports);


/***/ }),

/***/ "./packages/pori-metadata/src/lib/idleGameSc/type.idleGame.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllIdleGameEvents = exports.IdleGameSCEventInvSignatureTable = exports.IdleGameSCEventSignatureTable = exports.EIdleGameSCEventType = void 0;
var EIdleGameSCEventType;
(function (EIdleGameSCEventType) {
    EIdleGameSCEventType["AdventureFinished"] = "AdventureFinished";
    EIdleGameSCEventType["AdventureFortified"] = "AdventureFortified";
    EIdleGameSCEventType["AdventureStarted"] = "AdventureStarted";
    EIdleGameSCEventType["AdventureSupported1"] = "AdventureSupported1";
    EIdleGameSCEventType["AdventureSupported2"] = "AdventureSupported2";
    EIdleGameSCEventType["PorianDeposited"] = "PorianDeposited";
    EIdleGameSCEventType["PorianWithdrawed"] = "PorianWithdrawed";
    EIdleGameSCEventType["GameDurationChanged"] = "GameDurationChanged";
    EIdleGameSCEventType["SBattleSwapped"] = "SBattleSwapped";
})(EIdleGameSCEventType = exports.EIdleGameSCEventType || (exports.EIdleGameSCEventType = {}));
exports.IdleGameSCEventSignatureTable = {
    [EIdleGameSCEventType.AdventureFinished]: '0xacba132576685783d626ee7ff7486ac6cf8580b51ca1ef49ee36edb6303ac735',
    [EIdleGameSCEventType.AdventureFortified]: '0x71b4d764a280d810a1907567eb53bcf7ebe267f0d94d40d2a5f20009e7b73569',
    [EIdleGameSCEventType.AdventureStarted]: '0xd498194e39f0d0d9426ee530bd16b2182b34d07d968365c8fdcaf73c5a6d0ac5',
    [EIdleGameSCEventType.AdventureSupported1]: '0xbe2e74f68284a904ef29e10f3e20b2c9bb540481fb9903c1aead3e26cc56f8b1',
    [EIdleGameSCEventType.AdventureSupported2]: '0x6dbf0858232497280bfdf35e37adf2002793779d07d4f48947b17509c71dd41c',
    [EIdleGameSCEventType.PorianDeposited]: '0xc42131d410ea79f1eafecd549df9a392681974b7f4d9f4d78c216ea12b6766e8',
    [EIdleGameSCEventType.PorianWithdrawed]: '0x44402a61584354899786311a4f0c7bf924b31db70b5ebef891d88cee08156ed5',
    [EIdleGameSCEventType.GameDurationChanged]: '0xc62be04bfb76e5e364578771d33bb80ebbea7219b67ba068fb4bbdaf83e4a3c0',
    [EIdleGameSCEventType.SBattleSwapped]: '0x6bdac8de130455f3dbd97b2916ff758c9cb534e9770af694954b63b76169d728',
};
exports.IdleGameSCEventInvSignatureTable = {
    '0x6bdac8de130455f3dbd97b2916ff758c9cb534e9770af694954b63b76169d728': EIdleGameSCEventType.SBattleSwapped,
};
exports.AllIdleGameEvents = Object.keys(exports.IdleGameSCEventSignatureTable);


/***/ }),

/***/ "./packages/pori-metadata/src/lib/prod-porichain-poriverse_info.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gameInfo = exports.ABI_PORTAL = exports.ABI_MARKETPLACE = exports.ABI_RENTAL = exports.ABI_IDLE = void 0;
// ABI Idle
exports.ABI_IDLE = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"fragments","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward2","type":"uint256"}],"name":"AdventureFinished","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureFortified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"farmer","type":"address"},{"indexed":true,"internalType":"uint256","name":"startTime","type":"uint256"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"helper","type":"address"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported1","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported2","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rate","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"FragmentConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"adventureDuration","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"turnDuration","type":"uint256"}],"name":"GameDurationChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"env","type":"uint8"}],"name":"GameEnvChanged","type":"event"},{"anonymous":false,"inputs":[],"name":"NoFragments","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"porianNFT","type":"address"},{"indexed":true,"internalType":"address","name":"porianPower","type":"address"},{"indexed":true,"internalType":"address","name":"rentalCentre","type":"address"}],"name":"PorianContractAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"expiredAt","type":"uint256"}],"name":"PorianDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"}],"name":"PorianWithdrawed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rentalFee","type":"uint256"},{"indexed":true,"internalType":"address","name":"reservePool","type":"address"}],"name":"RentalConfigsSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"rigyToken","type":"address"},{"indexed":false,"internalType":"address","name":"rikenToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"rigyReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rikenReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winRatio","type":"uint256"}],"name":"RewardConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rewardLevel","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amountCell","type":"uint256"}],"name":"RewardLevelChanged","type":"event"},{"inputs":[],"name":"adventureDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"blockedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decreasedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"env","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mechaDiscount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mines","outputs":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mission2Riken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianNFT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianPower","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"portalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"portalInfos","outputs":[{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint256","name":"supplied","type":"uint256"},{"internalType":"uint256","name":"locked","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rentalCentre","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rentalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rentalPriceOf","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint128","name":"price","type":"uint128"},{"internalType":"uint128","name":"endTime","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reservePool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardLevels","outputs":[{"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"internalType":"uint256","name":"amountCell","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFragments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"turnDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_adventureDuration","type":"uint256"},{"internalType":"uint256","name":"_turnDuration","type":"uint256"}],"name":"setGameDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setGameEnv","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[4]","name":"rewardRatios","type":"uint256[4]"},{"internalType":"uint256[4]","name":"amountCells","type":"uint256[4]"}],"name":"setRewardLevels","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_rigyToken","type":"address"},{"internalType":"address","name":"_rikenToken","type":"address"},{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"},{"internalType":"uint256","name":"_winRatio","type":"uint256"}],"name":"setRewardConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_porianNFT","type":"address"},{"internalType":"address","name":"_porianPower","type":"address"},{"internalType":"address","name":"_rentalCentre","type":"address"}],"name":"setPorianContractAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fragmentRate","type":"uint256"},{"internalType":"uint256","name":"_fragmentAmount","type":"uint256"},{"internalType":"address","name":"_fragmentToken","type":"address"}],"name":"setFragmentConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porian","type":"uint256"}],"name":"getOwnerNowOf","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"porian","type":"uint256"}],"name":"notExisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"expiredAt","type":"uint256"},{"internalType":"bytes12","name":"flags","type":"bytes12"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"onAuthorized","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"porians","type":"uint256[]"}],"name":"withdrawPorians","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porianID","type":"uint256"},{"internalType":"uint256","name":"atTime","type":"uint256"}],"name":"getOwnerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"isMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"startAdventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"support1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"fortify","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"support2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"}],"name":"finish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"mission","type":"uint256"}],"name":"getPortalInfoOf","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"bytes12","name":"_selectedCells","type":"bytes12"}],"name":"_calculateNormalReward","outputs":[{"internalType":"uint256","name":"reward1","type":"uint256"},{"internalType":"uint256","name":"reward2","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"internalType":"struct IdleGame.MineInfo","name":"m","type":"tuple"},{"internalType":"uint8","name":"_env","type":"uint8"},{"internalType":"uint256","name":"fRigyReward","type":"uint256"},{"internalType":"uint256","name":"fRikenReward","type":"uint256"},{"internalType":"uint256","name":"hRigyReward","type":"uint256"},{"internalType":"uint256","name":"hRikenReward","type":"uint256"}],"name":"_calculateBigReward","outputs":[{"internalType":"address","name":"winner","type":"address"},{"internalType":"uint256","name":"fragments","type":"uint256"},{"internalType":"uint256","name":"fRigyRewardNew","type":"uint256"},{"internalType":"uint256","name":"fRikenRewardNew","type":"uint256"},{"internalType":"uint256","name":"hRigyRewardNew","type":"uint256"},{"internalType":"uint256","name":"hRikenRewardNew","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"atkPowerOf","outputs":[{"internalType":"uint256","name":"atkPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"defPowerOf","outputs":[{"internalType":"uint256","name":"defPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"randomRewardLevel","outputs":[{"internalType":"uint8","name":"rewardLevel","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"},{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"name":"setRewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"getRewardInfo","outputs":[{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setEnv2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getEnvOf","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint64","name":"timestamp","type":"uint64"}],"name":"setStartTime2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getStartTimeOfRewardMap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"mode","type":"uint256"}],"name":"getRewardOf","outputs":[{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"ep","type":"uint256"},{"internalType":"uint256","name":"ap","type":"uint256"}],"name":"getESB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"rikenAmounts","type":"uint256[]"},{"internalType":"uint256","name":"_mechaDiscount","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missionLimit","type":"uint128"},{"internalType":"uint256","name":"_decreasedTime","type":"uint256"}],"name":"setRikenPortalConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"portalInfoOf","outputs":[{"internalType":"uint256","name":"suppliedRiken","type":"uint256"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"availableRiken","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint128","name":"capacityMissions","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missions","type":"uint256"},{"internalType":"bool","name":"_isMecha","type":"bool"}],"name":"getRikenAmount","outputs":[{"internalType":"uint256","name":"rikenAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"}],"name":"sqrt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"missionOfPori","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missionId","type":"uint256"},{"internalType":"bool","name":"isAP","type":"bool"}],"name":"getPoriansAtSCell","outputs":[{"internalType":"uint256","name":"id1","type":"uint256"},{"internalType":"uint256","name":"id2","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missionId","type":"uint256"},{"internalType":"uint256[]","name":"srcIds","type":"uint256[]"},{"internalType":"uint256[]","name":"desIds","type":"uint256[]"},{"internalType":"uint8","name":"sTreasure","type":"uint8"}],"name":"swapPorians","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
exports.ABI_RENTAL = JSON.parse('[{"inputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"yes","type":"bool"}],"name":"AutoRenewSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPricePerSec","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"ItemInfoChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pricePerSec","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"ItemListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"renter","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pricePerSec","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiredAt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"}],"name":"ItemRented","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"ItemUnlisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"MarketFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldNFTToken","type":"address"},{"indexed":false,"internalType":"address","name":"newNFTToken","type":"address"}],"name":"NFTTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldPaymentToken","type":"address"},{"indexed":false,"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"PaymentTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPricePerSec","type":"uint256"}],"name":"PricePerSecChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"RentalTimeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":false,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePoolChanged","type":"event"},{"inputs":[],"name":"A_HUNDRED_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"pricePerSec","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"listItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"newPricePerSec","type":"uint256"}],"name":"changePrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"newPricePerSec","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"changeItemInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"unlistItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"rentalTime","type":"uint256"}],"name":"rentItem","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"bool","name":"yes","type":"bool"}],"name":"setAutoRenew","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"setRentalTime","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
exports.ABI_MARKETPLACE = JSON.parse('[{"inputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"}],"name":"ItemSold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemUnlisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"MarketFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldNFTToken","type":"address"},{"indexed":true,"internalType":"address","name":"newNFTToken","type":"address"}],"name":"NFTTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldPaymentToken","type":"address"},{"indexed":true,"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"PaymentTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":true,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePoolChanged","type":"event"},{"inputs":[],"name":"A_HUNDRED_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"changeFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"changePaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newNFTToken","type":"address"}],"name":"changeNFTToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newReservePool","type":"address"}],"name":"changeReservePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"listItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"},{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"changePrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"unlistItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"buyItem","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"getItem","outputs":[{"components":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"enum Marketplace.ItemState","name":"state","type":"uint8"},{"internalType":"address","name":"buyer","type":"address"}],"internalType":"struct Marketplace.MarketItem","name":"item","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalItems","outputs":[{"internalType":"uint256","name":"totalItems","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getConfigs","outputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"view","type":"function"}]');
exports.ABI_PORTAL = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RikenDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RikenWithdrawn","type":"event"},{"inputs":[{"internalType":"bytes32","name":"key","type":"bytes32"}],"name":"addressOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missionId","type":"uint256"},{"internalType":"address","name":"explorer","type":"address"},{"internalType":"address","name":"assistant","type":"address"}],"name":"closePortal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"configuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"keys","type":"bytes32[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"configure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"missionId","type":"uint256"}],"name":"getPortalInfoOf","outputs":[{"internalType":"bool","name":"expressMode","type":"bool"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missionCount","type":"uint256"},{"internalType":"bool","name":"discounted","type":"bool"}],"name":"getRikenAmount","outputs":[{"internalType":"uint256","name":"rikenAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"hasMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"missionRiken","type":"uint256[]"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porianId","type":"uint256"}],"name":"isMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mission2Riken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"missionId","type":"uint256"}],"name":"missionInfo","outputs":[{"internalType":"bool","name":"expressMode","type":"bool"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"bool","name":"expressMode","type":"bool"},{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"openPortal","outputs":[{"internalType":"uint256","name":"duration","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianNFT","outputs":[{"internalType":"contract Porian","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"portalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"portalInfoOf","outputs":[{"internalType":"uint256","name":"suppliedRiken","type":"uint256"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"availableRiken","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint128","name":"capacityMissions","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"portalInfos","outputs":[{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint256","name":"supplied","type":"uint256"},{"internalType":"uint256","name":"locked","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"riken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"missionRiken","type":"uint256[]"}],"name":"setMissionRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawRiken","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
exports.gameInfo = {
    m: {
        app: {
            name: '"PoriAdventureGame";',
            version: "'1.0.0';",
            apiUrl: 'https://porichain-api.poriverse.io',
            apiKey: '3537a676-6ad9-462a-ae31-3cc2dd6f8c1d',
            apiSecretKey: '55cdeacd6ef64abc90097ecc5def8ab1044d968892714cff833a11357c1f4168',
            locale: 'en',
            fallbackLocale: 'en',
            urlAdventure: 'https://adventure.porichain.io',
            urlMarketplace: 'https://marketplace.porichain.io',
            linkPori2D: 'https://photos.poriverse.io',
            linkPori3D: 'https://3d-model.poriverse.io/index.html',
            token: {
                nativeSymbol: 'RIKEN',
                nativeAddress: '0x57DF4ACC269e5F04be0f6e4d5b26d9467b71706e',
                nativeDecimal: '18',
                nativeId: 'tether',
                inGameSymbol: 'RIGY',
                inGameAddress: '0xa31D195021dDb415E3937E5f846408b02A9d8419',
                inGameDecimal: '18',
                inGameId: 'siacoin',
                fragmentSymbol: 'FRAGMENT',
                fragmentAddress: '0xC0a2792fE016c2d4f1b9e30862b08287AE9Fcc68',
                fragmentDecimal: '0',
            },
            scCreatedBlock: {
                idle: 7643,
            },
            contractAddress: {
                PoriNFTBreedable: '0xe27C1017907Db12cb377d4746cA3435B2027514C',
                poriBreedingRule: '0x7DB415742ff3393c954262B03D1E719871547F0D',
                marketplaceAddress: '0x2d6957F05AFD85697305b7243C76664f7cefaDF9',
                rentalAddress: '0xdc6729725B29779752f45C2Ef3F5384cbA6cC0BA',
                idleGameAddress: '0xd678f37434d06Fc3Eb43c11024998FAaFd411881',
                rainbowPortal: '0x5712696231255765aeFBafe78dd7849B60C190c4',
                poriLensAddress: '0xB73B8A250B317D52eD88E9b510919eCFAE5923a0',
                itemsAddress: '0xA5e16E6bac094c1B38c64d3e0590c3b42f78e669',
                multicallAddress: '0x309f6E71d91BdC916Aab66C737719e242E36f2E3',
            },
            rpcMetamask: {
                chainId: '52861',
            },
        },
    },
    n: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: [
            'https://rpc-mainnet.maticvigil.com/v1/ca075eb5895f0ea35c4c45a026ad062cd5153437',
        ],
        blockExplorerUrls: ['https://polygonscan.com/'],
    },
    b: {
        Terra: '1',
        Aqua: '2',
        Magica: '3',
        Mecha: '4',
        Ancia: '5',
        Stellar: '6',
        Mysteria: '7',
    },
    l: {
        Egg: 1,
        Adult: 2,
    },
    k: {
        Origin: 2,
        Genesis: 1,
    },
    a: {
        ForSale: 1,
        ForRent: 2,
        Renting: 3,
        Available: 4,
        InGameChapter1: 5,
    },
    c: 2,
    d: {
        selectClass: '',
        sortPower: 'minePower',
        sortOrder: 'asc',
    },
    e: 7955107200,
    g: {
        ExploreMission: 1,
        AssitMission: 2,
        CanAssitMission: 3,
    },
    f: {
        Explore: 'Explore',
        Assit: 'Assit',
        Fortify1: 3,
        Fortify2: 4,
        Finish: 100,
    },
    i: {
        Explore: 3,
        Assit: 3,
        Fortify1: 1,
        Fortify2: 1,
        Finish: 100,
    },
    h: {
        Explore: 'Explore',
        Assit: 'Assit',
    },
    j: {
        Explore: 'Explore',
        Supported1: 'Supported1',
        Fortify1: 'Fortify1',
        Supported2: 'Supported2',
    },
};


/***/ }),

/***/ "./packages/pori-metadata/src/lib/prod-poriverse_info.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gameInfo = exports.ABI_PORTAL = exports.ABI_MARKETPLACE = exports.ABI_RENTAL = exports.ABI_IDLE = void 0;
// ABI Idle
exports.ABI_IDLE = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"fragments","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward2","type":"uint256"}],"name":"AdventureFinished","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureFortified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"farmer","type":"address"},{"indexed":true,"internalType":"uint256","name":"startTime","type":"uint256"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"helper","type":"address"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported1","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported2","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rate","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"FragmentConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"adventureDuration","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"turnDuration","type":"uint256"}],"name":"GameDurationChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"env","type":"uint8"}],"name":"GameEnvChanged","type":"event"},{"anonymous":false,"inputs":[],"name":"NoFragments","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"porianNFT","type":"address"},{"indexed":true,"internalType":"address","name":"porianPower","type":"address"},{"indexed":true,"internalType":"address","name":"rentalCentre","type":"address"}],"name":"PorianContractAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"expiredAt","type":"uint256"}],"name":"PorianDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"}],"name":"PorianWithdrawed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rentalFee","type":"uint256"},{"indexed":true,"internalType":"address","name":"reservePool","type":"address"}],"name":"RentalConfigsSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"rigyToken","type":"address"},{"indexed":false,"internalType":"address","name":"rikenToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"rigyReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rikenReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winRatio","type":"uint256"}],"name":"RewardConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rewardLevel","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amountCell","type":"uint256"}],"name":"RewardLevelChanged","type":"event"},{"inputs":[],"name":"adventureDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"blockedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decreasedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"env","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mechaDiscount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mines","outputs":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mission2Riken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianNFT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianPower","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"portalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"portalInfos","outputs":[{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint256","name":"supplied","type":"uint256"},{"internalType":"uint256","name":"locked","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rentalCentre","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rentalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rentalPriceOf","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint128","name":"price","type":"uint128"},{"internalType":"uint128","name":"endTime","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reservePool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardLevels","outputs":[{"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"internalType":"uint256","name":"amountCell","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFragments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"turnDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_adventureDuration","type":"uint256"},{"internalType":"uint256","name":"_turnDuration","type":"uint256"}],"name":"setGameDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setGameEnv","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[4]","name":"rewardRatios","type":"uint256[4]"},{"internalType":"uint256[4]","name":"amountCells","type":"uint256[4]"}],"name":"setRewardLevels","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_rigyToken","type":"address"},{"internalType":"address","name":"_rikenToken","type":"address"},{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"},{"internalType":"uint256","name":"_winRatio","type":"uint256"}],"name":"setRewardConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_porianNFT","type":"address"},{"internalType":"address","name":"_porianPower","type":"address"},{"internalType":"address","name":"_rentalCentre","type":"address"}],"name":"setPorianContractAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fragmentRate","type":"uint256"},{"internalType":"uint256","name":"_fragmentAmount","type":"uint256"},{"internalType":"address","name":"_fragmentToken","type":"address"}],"name":"setFragmentConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porian","type":"uint256"}],"name":"getOwnerNowOf","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"porian","type":"uint256"}],"name":"notExisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"expiredAt","type":"uint256"},{"internalType":"bytes12","name":"flags","type":"bytes12"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"onAuthorized","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"porians","type":"uint256[]"}],"name":"withdrawPorians","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porianID","type":"uint256"},{"internalType":"uint256","name":"atTime","type":"uint256"}],"name":"getOwnerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"isMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"startAdventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"support1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"fortify","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"support2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"}],"name":"finish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"mission","type":"uint256"}],"name":"getPortalInfoOf","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"bytes12","name":"_selectedCells","type":"bytes12"}],"name":"_calculateNormalReward","outputs":[{"internalType":"uint256","name":"reward1","type":"uint256"},{"internalType":"uint256","name":"reward2","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"internalType":"struct IdleGame.MineInfo","name":"m","type":"tuple"},{"internalType":"uint8","name":"_env","type":"uint8"},{"internalType":"uint256","name":"fRigyReward","type":"uint256"},{"internalType":"uint256","name":"fRikenReward","type":"uint256"},{"internalType":"uint256","name":"hRigyReward","type":"uint256"},{"internalType":"uint256","name":"hRikenReward","type":"uint256"}],"name":"_calculateBigReward","outputs":[{"internalType":"address","name":"winner","type":"address"},{"internalType":"uint256","name":"fragments","type":"uint256"},{"internalType":"uint256","name":"fRigyRewardNew","type":"uint256"},{"internalType":"uint256","name":"fRikenRewardNew","type":"uint256"},{"internalType":"uint256","name":"hRigyRewardNew","type":"uint256"},{"internalType":"uint256","name":"hRikenRewardNew","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"atkPowerOf","outputs":[{"internalType":"uint256","name":"atkPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"defPowerOf","outputs":[{"internalType":"uint256","name":"defPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"randomRewardLevel","outputs":[{"internalType":"uint8","name":"rewardLevel","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"},{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"name":"setRewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"getRewardInfo","outputs":[{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setEnv2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getEnvOf","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint64","name":"timestamp","type":"uint64"}],"name":"setStartTime2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getStartTimeOfRewardMap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"mode","type":"uint256"}],"name":"getRewardOf","outputs":[{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"ep","type":"uint256"},{"internalType":"uint256","name":"ap","type":"uint256"}],"name":"getESB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"rikenAmounts","type":"uint256[]"},{"internalType":"uint256","name":"_mechaDiscount","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missionLimit","type":"uint128"},{"internalType":"uint256","name":"_decreasedTime","type":"uint256"}],"name":"setRikenPortalConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"portalInfoOf","outputs":[{"internalType":"uint256","name":"suppliedRiken","type":"uint256"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"availableRiken","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint128","name":"capacityMissions","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missions","type":"uint256"},{"internalType":"bool","name":"_isMecha","type":"bool"}],"name":"getRikenAmount","outputs":[{"internalType":"uint256","name":"rikenAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"}],"name":"sqrt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"missionOfPori","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]');
exports.ABI_RENTAL = JSON.parse('[{"inputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"yes","type":"bool"}],"name":"AutoRenewSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPricePerSec","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"ItemInfoChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pricePerSec","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"ItemListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"renter","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pricePerSec","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiredAt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"}],"name":"ItemRented","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"ItemUnlisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"MarketFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldNFTToken","type":"address"},{"indexed":false,"internalType":"address","name":"newNFTToken","type":"address"}],"name":"NFTTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldPaymentToken","type":"address"},{"indexed":false,"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"PaymentTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPricePerSec","type":"uint256"}],"name":"PricePerSecChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"RentalTimeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":false,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePoolChanged","type":"event"},{"inputs":[],"name":"A_HUNDRED_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"pricePerSec","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"listItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"newPricePerSec","type":"uint256"}],"name":"changePrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"newPricePerSec","type":"uint256"},{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"changeItemInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"unlistItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"rentalTime","type":"uint256"}],"name":"rentItem","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"bool","name":"yes","type":"bool"}],"name":"setAutoRenew","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"minRentalTime","type":"uint256"},{"internalType":"uint256","name":"maxRentalTime","type":"uint256"}],"name":"setRentalTime","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
exports.ABI_MARKETPLACE = JSON.parse('[{"inputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"}],"name":"ItemSold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemUnlisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"MarketFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldNFTToken","type":"address"},{"indexed":true,"internalType":"address","name":"newNFTToken","type":"address"}],"name":"NFTTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldPaymentToken","type":"address"},{"indexed":true,"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"PaymentTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":true,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePoolChanged","type":"event"},{"inputs":[],"name":"A_HUNDRED_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"changeFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"changePaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newNFTToken","type":"address"}],"name":"changeNFTToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newReservePool","type":"address"}],"name":"changeReservePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"listItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"},{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"changePrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"unlistItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"buyItem","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"getItem","outputs":[{"components":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"enum Marketplace.ItemState","name":"state","type":"uint8"},{"internalType":"address","name":"buyer","type":"address"}],"internalType":"struct Marketplace.MarketItem","name":"item","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalItems","outputs":[{"internalType":"uint256","name":"totalItems","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getConfigs","outputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"view","type":"function"}]');
exports.ABI_PORTAL = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RikenDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RikenWithdrawn","type":"event"},{"inputs":[{"internalType":"bytes32","name":"key","type":"bytes32"}],"name":"addressOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missionId","type":"uint256"},{"internalType":"address","name":"explorer","type":"address"},{"internalType":"address","name":"assistant","type":"address"}],"name":"closePortal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"configuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"keys","type":"bytes32[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"configure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"missionId","type":"uint256"}],"name":"getPortalInfoOf","outputs":[{"internalType":"bool","name":"expressMode","type":"bool"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missionCount","type":"uint256"},{"internalType":"bool","name":"discounted","type":"bool"}],"name":"getRikenAmount","outputs":[{"internalType":"uint256","name":"rikenAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"hasMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"missionRiken","type":"uint256[]"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porianId","type":"uint256"}],"name":"isMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mission2Riken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"missionId","type":"uint256"}],"name":"missionInfo","outputs":[{"internalType":"bool","name":"expressMode","type":"bool"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"bool","name":"expressMode","type":"bool"},{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"openPortal","outputs":[{"internalType":"uint256","name":"duration","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianNFT","outputs":[{"internalType":"contract Porian","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"portalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"portalInfoOf","outputs":[{"internalType":"uint256","name":"suppliedRiken","type":"uint256"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"availableRiken","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint128","name":"capacityMissions","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"portalInfos","outputs":[{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint256","name":"supplied","type":"uint256"},{"internalType":"uint256","name":"locked","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"riken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"missionRiken","type":"uint256[]"}],"name":"setMissionRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawRiken","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
exports.gameInfo = {
    m: {
        app: {
            name: '"PoriAdventureGame";',
            version: "'1.0.0';",
            apiUrl: 'https://api.poriverse.io',
            apiKey: '3537a676-6ad9-462a-ae31-3cc2dd6f8c1d',
            apiSecretKey: '55cdeacd6ef64abc90097ecc5def8ab1044d968892714cff833a11357c1f4168',
            locale: 'en',
            fallbackLocale: 'en',
            urlAdventure: 'https://adventure.poriverse.io',
            urlMarketplace: 'https://marketplace.poriverse.io',
            linkPori2D: 'https://photos.poriverse.io',
            linkPori3D: 'https://3d-model.poriverse.io/index.html',
            token: {
                nativeSymbol: 'RIKEN',
                nativeAddress: '0xFbBd93fC3BE8B048c007666AF4846e4A36BACC95',
                nativeDecimal: '18',
                nativeId: 'tether',
                inGameSymbol: 'RIGY',
                inGameAddress: '0x9F994e2783b44C83204377589854A17c6b0c226d',
                inGameDecimal: '18',
                inGameId: 'siacoin',
                fragmentSymbol: 'FRAGMENT',
                fragmentAddress: '0xB640AdA89445ce74C6554bf27CD1aecE9CE998e4',
                fragmentDecimal: '0',
            },
            scCreatedBlock: {
                idle: 27503296,
            },
            contractAddress: {
                PoriNFTBreedable: '0x81d5a77b1a070bec11280af89849ac5d74bb06cf',
                poriBreedingRule: '0x34041860276ebafe36067974acf52e232dc8452f',
                marketplaceAddress: '0xb73b8a250b317d52ed88e9b510919ecfae5923a0',
                rentalAddress: '0xEa5ee287DE00112b427f96eCe8d2725EA2BfEf41',
                idleGameAddress: '0xF8D301Db0bcbEe19B91629402AEF9FE569bE0221',
                multicallAddress: '0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507',
            },
            rpcMetamask: {
                chainId: '137',
            },
        },
    },
    n: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: [
            'https://rpc-mainnet.maticvigil.com/v1/ca075eb5895f0ea35c4c45a026ad062cd5153437',
        ],
        blockExplorerUrls: ['https://polygonscan.com/'],
    },
    b: {
        Terra: '1',
        Aqua: '2',
        Magica: '3',
        Mecha: '4',
        Ancia: '5',
        Stellar: '6',
        Mysteria: '7',
    },
    l: {
        Egg: 1,
        Adult: 2,
    },
    k: {
        Origin: 2,
        Genesis: 1,
    },
    a: {
        ForSale: 1,
        ForRent: 2,
        Renting: 3,
        Available: 4,
        InGameChapter1: 5,
    },
    c: 2,
    d: {
        selectClass: '',
        sortPower: 'minePower',
        sortOrder: 'asc',
    },
    e: 7955107200,
    g: {
        ExploreMission: 1,
        AssitMission: 2,
        CanAssitMission: 3,
    },
    f: {
        Explore: 'Explore',
        Assit: 'Assit',
        Fortify1: 3,
        Fortify2: 4,
        Finish: 100,
    },
    i: {
        Explore: 3,
        Assit: 3,
        Fortify1: 1,
        Fortify2: 1,
        Finish: 100,
    },
    h: {
        Explore: 'Explore',
        Assit: 'Assit',
    },
    j: {
        Explore: 'Explore',
        Supported1: 'Supported1',
        Fortify1: 'Fortify1',
        Supported2: 'Supported2',
    },
};


/***/ }),

/***/ "./packages/pori-metadata/src/lib/sta-poriverse_info.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gameInfo = exports.ABI_IDLE = void 0;
// ABI Idle
exports.ABI_IDLE = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"fragments","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward2","type":"uint256"}],"name":"AdventureFinished","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureFortified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"farmer","type":"address"},{"indexed":true,"internalType":"uint256","name":"startTime","type":"uint256"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"helper","type":"address"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported1","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported2","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rate","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"FragmentConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"adventureDuration","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"turnDuration","type":"uint256"}],"name":"GameDurationChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"env","type":"uint8"}],"name":"GameEnvChanged","type":"event"},{"anonymous":false,"inputs":[],"name":"NoFragments","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"porianNFT","type":"address"},{"indexed":true,"internalType":"address","name":"porianPower","type":"address"},{"indexed":true,"internalType":"address","name":"rentalCentre","type":"address"}],"name":"PorianContractAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"expiredAt","type":"uint256"}],"name":"PorianDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"}],"name":"PorianWithdrawed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rentalFee","type":"uint256"},{"indexed":true,"internalType":"address","name":"reservePool","type":"address"}],"name":"RentalConfigsSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"rigyToken","type":"address"},{"indexed":false,"internalType":"address","name":"rikenToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"rigyReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rikenReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winRatio","type":"uint256"}],"name":"RewardConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rewardLevel","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amountCell","type":"uint256"}],"name":"RewardLevelChanged","type":"event"},{"inputs":[],"name":"adventureDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"blockedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"env","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mines","outputs":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianNFT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianPower","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rentalCentre","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rentalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rentalPriceOf","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint128","name":"price","type":"uint128"},{"internalType":"uint128","name":"endTime","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reservePool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardLevels","outputs":[{"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"internalType":"uint256","name":"amountCell","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"turnDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_adventureDuration","type":"uint256"},{"internalType":"uint256","name":"_turnDuration","type":"uint256"}],"name":"setGameDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setGameEnv","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[4]","name":"rewardRatios","type":"uint256[4]"},{"internalType":"uint256[4]","name":"amountCells","type":"uint256[4]"}],"name":"setRewardLevels","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_rigyToken","type":"address"},{"internalType":"address","name":"_rikenToken","type":"address"},{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"},{"internalType":"uint256","name":"_winRatio","type":"uint256"}],"name":"setRewardConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_porianNFT","type":"address"},{"internalType":"address","name":"_porianPower","type":"address"},{"internalType":"address","name":"_rentalCentre","type":"address"}],"name":"setPorianContractAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fragmentRate","type":"uint256"},{"internalType":"uint256","name":"_fragmentAmount","type":"uint256"},{"internalType":"address","name":"_fragmentToken","type":"address"}],"name":"setFragmentConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"expiredAt","type":"uint256"},{"internalType":"bytes12","name":"flags","type":"bytes12"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"onAuthorized","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"porians","type":"uint256[]"}],"name":"withdrawPorians","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porianID","type":"uint256"},{"internalType":"uint256","name":"atTime","type":"uint256"}],"name":"getOwnerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"startAdventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"support1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"fortify","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"support2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"}],"name":"finish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"bytes12","name":"_selectedCells","type":"bytes12"}],"name":"_calculateNormalReward","outputs":[{"internalType":"uint256","name":"reward1","type":"uint256"},{"internalType":"uint256","name":"reward2","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"fPorian1","type":"uint256"},{"internalType":"uint256","name":"fPorian2","type":"uint256"},{"internalType":"uint256","name":"hPorian1","type":"uint256"},{"internalType":"uint256","name":"hPorian2","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"_calculateBigReward","outputs":[{"internalType":"bool","name":"isFarmer","type":"bool"},{"internalType":"uint256","name":"fragments","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"atkPowerOf","outputs":[{"internalType":"uint256","name":"atkPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"defPowerOf","outputs":[{"internalType":"uint256","name":"defPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"randomRewardLevel","outputs":[{"internalType":"uint8","name":"rewardLevel","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"},{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"name":"setRewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"getRewardInfo","outputs":[{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setEnv2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getEnvOf","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint64","name":"timestamp","type":"uint64"}],"name":"setStartTime2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getStartTimeOfRewardMap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"mode","type":"uint256"}],"name":"getRewardOf","outputs":[{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"}],"stateMutability":"view","type":"function"}]');
JSON.parse('[{"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]');
JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"operator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"_approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
JSON.parse('[{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"baseTokenURI","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiredAt","type":"uint256"},{"indexed":false,"internalType":"bytes12","name":"flags","type":"bytes12"}],"name":"Authorized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"eggId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"fatherId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"motherId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"birthdate","type":"uint256"}],"name":"Breeded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldBreedingRule","type":"address"},{"indexed":true,"internalType":"address","name":"newBreedingRule","type":"address"}],"name":"BreedingRuleAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"eggId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"gene","type":"uint256"}],"name":"EggHatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"porianId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"extraGene","type":"uint256"}],"name":"ExtraGeneActive","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldGeneFactory","type":"address"},{"indexed":true,"internalType":"address","name":"newGeneFactory","type":"address"}],"name":"GeneFactoryAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"CAN_AUTHORIZE_FLAG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINTER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MUST_BE_EXPIRED_FLAG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PAUSER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"authorityOf","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes12","name":"","type":"bytes12"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getFlagAt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getRoleMember","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleMemberCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"expiredAt","type":"uint256"},{"internalType":"bytes12","name":"flags","type":"bytes12"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeAuthorize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeAuthorize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"internalType":"uint256[]","name":"expiredAts","type":"uint256[]"},{"internalType":"bytes12[]","name":"flags","type":"bytes12[]"},{"internalType":"bytes[]","name":"_datas","type":"bytes[]"}],"name":"safeAuthorizeBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"internalType":"bytes[]","name":"_datas","type":"bytes[]"}],"name":"safeAuthorizeBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"bool","name":"value","type":"bool"}],"name":"setFlagAt","outputs":[{"internalType":"bytes12","name":"","type":"bytes12"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"baseTokenURI","type":"string"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"breedingRule","type":"address"}],"name":"setBreedingRuleAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"geneFactory","type":"address"}],"name":"setGeneFactoryAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"breedingRuleAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"geneFactoryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"gene","type":"uint256"}],"name":"mintPori","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"recipients","type":"address[]"},{"internalType":"uint256[]","name":"genes","type":"uint256[]"}],"name":"mintPoriBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"dadId","type":"uint256"},{"internalType":"uint256","name":"momId","type":"uint256"}],"name":"breed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"eggId","type":"uint256"}],"name":"hatchEgg","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"activeExtraGene","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"getPori","outputs":[{"internalType":"uint256","name":"gene","type":"uint256"},{"internalType":"uint256","name":"extraGene","type":"uint256"},{"internalType":"uint256","name":"fatherId","type":"uint256"},{"internalType":"uint256","name":"motherId","type":"uint256"},{"internalType":"uint128","name":"birthdate","type":"uint128"},{"internalType":"uint128","name":"breedingCount","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"getFamily","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"}]');
JSON.parse('[{"constant":true,"inputs":[],"name":"getCurrentBlockTimestamp","outputs":[{"name":"timestamp","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"name":"target","type":"address"},{"name":"callData","type":"bytes"}],"name":"calls","type":"tuple[]"}],"name":"aggregate","outputs":[{"name":"blockNumber","type":"uint256"},{"name":"returnData","type":"bytes[]"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getLastBlockHash","outputs":[{"name":"blockHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getEthBalance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentBlockDifficulty","outputs":[{"name":"difficulty","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentBlockGasLimit","outputs":[{"name":"gaslimit","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentBlockCoinbase","outputs":[{"name":"coinbase","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"blockNumber","type":"uint256"}],"name":"getBlockHash","outputs":[{"name":"blockHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"}]');
JSON.parse('[{"inputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"}],"name":"ItemSold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemUnlisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"MarketFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldNFTToken","type":"address"},{"indexed":true,"internalType":"address","name":"newNFTToken","type":"address"}],"name":"NFTTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldPaymentToken","type":"address"},{"indexed":true,"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"PaymentTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":true,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePoolChanged","type":"event"},{"inputs":[],"name":"A_HUNDRED_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"changeFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newPaymentToken","type":"address"}],"name":"changePaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newNFTToken","type":"address"}],"name":"changeNFTToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newReservePool","type":"address"}],"name":"changeReservePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"listItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"},{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"changePrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"unlistItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"buyItem","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"getItem","outputs":[{"components":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"enum Marketplace.ItemState","name":"state","type":"uint8"},{"internalType":"address","name":"buyer","type":"address"}],"internalType":"struct Marketplace.MarketItem","name":"item","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalItems","outputs":[{"internalType":"uint256","name":"totalItems","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getConfigs","outputs":[{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"address","name":"nftToken","type":"address"},{"internalType":"address","name":"reservePool","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"view","type":"function"}]');
JSON.parse('[{"inputs":[{"internalType":"uint256","name":"hatchingTime","type":"uint256"},{"internalType":"uint256","name":"maxBreedingCount","type":"uint256"},{"internalType":"uint256","name":"relationshipLevel","type":"uint256"},{"internalType":"address","name":"feeToken1","type":"address"},{"internalType":"address","name":"feeToken2","type":"address"},{"internalType":"address","name":"reservePool1","type":"address"},{"internalType":"address","name":"reservePool2","type":"address"},{"internalType":"uint256[]","name":"fee1ByBreedingCount","type":"uint256[]"},{"internalType":"uint256[]","name":"fee2ByBreedingCount","type":"uint256[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"maxBreedingCount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"relationshipLevel","type":"uint256"}],"name":"BreedingConfigChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"breedingCount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"Fee1ByBreedingCount","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"breedingCount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"Fee2ByBreedingCount","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldFeeToken","type":"address"},{"indexed":true,"internalType":"address","name":"newFeeToken","type":"address"}],"name":"FeeToken1Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldFeeToken","type":"address"},{"indexed":true,"internalType":"address","name":"newFeeToken","type":"address"}],"name":"FeeToken2Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"oldHatchingTime","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"newHatchingTime","type":"uint256"}],"name":"HatchingConfigChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldPoriNFT","type":"address"},{"indexed":true,"internalType":"address","name":"newPoriNFT","type":"address"}],"name":"PoriNFTChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":true,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePool1Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldReservePool","type":"address"},{"indexed":true,"internalType":"address","name":"newReservePool","type":"address"}],"name":"ReservePool2Changed","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getConfigs","outputs":[{"internalType":"uint256","name":"maxBreedingCount","type":"uint256"},{"internalType":"uint256","name":"relationshipLevel","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getConfigAddresses","outputs":[{"internalType":"address","name":"poriNFT","type":"address"},{"internalType":"address","name":"feeToken1","type":"address"},{"internalType":"address","name":"feeToken2","type":"address"},{"internalType":"address","name":"reservePool1","type":"address"},{"internalType":"address","name":"reservePool2","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"breedingCount","type":"uint128"}],"name":"getFeeOf","outputs":[{"internalType":"uint256","name":"fee1","type":"uint256"},{"internalType":"uint256","name":"fee2","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getHatchingConfig","outputs":[{"internalType":"uint256","name":"hatchingTime","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"hatchingTime","type":"uint256"}],"name":"setHatchingConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maxBreedingCount","type":"uint256"},{"internalType":"uint256","name":"relationshipLevel","type":"uint256"}],"name":"setBreedingConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"fee1ByBreedingCount","type":"uint256[]"}],"name":"setFee1ByBreedingCount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"fee2ByBreedingCount","type":"uint256[]"}],"name":"setFee2ByBreedingCount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"nft","type":"address"}],"name":"setPoriNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeToken1","type":"address"}],"name":"setFeeToken1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeToken2","type":"address"}],"name":"setFeeToken2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newReservePool1","type":"address"}],"name":"setReservePool1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newReservePool2","type":"address"}],"name":"setReservePool2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"dadId","type":"uint256"},{"internalType":"uint256","name":"dadGene","type":"uint256"},{"internalType":"uint128","name":"dadBreedingCount","type":"uint128"},{"internalType":"uint256","name":"momId","type":"uint256"},{"internalType":"uint256","name":"momGene","type":"uint256"},{"internalType":"uint128","name":"momBreedingCount","type":"uint128"}],"name":"breed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"gene","type":"uint256"},{"internalType":"uint256[2]","name":"parents","type":"uint256[2]"},{"internalType":"uint128","name":"birthdate","type":"uint128"},{"internalType":"uint128","name":"breedingCount","type":"uint128"}],"internalType":"struct PoriNFTBreedable.PoriInfo","name":"pori","type":"tuple"}],"name":"validateHatchingRule","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]');
exports.gameInfo = {
    m: {
        app: {
            name: '"PoriIdleGame";',
            version: "'1.0.0';",
            apiUrl: 'https://stage2-po-api.vinaweb.app',
            apiKey: '3537a676-6ad9-462a-ae31-3cc2dd6f8c1d',
            apiSecretKey: '55cdeacd6ef64abc90097ecc5def8ab1044d968892714cff833a11357c1f4168',
            locale: 'en',
            fallbackLocale: 'en',
            urlAdventure: 'https://stag-adventure.poriverse.io',
            urlMarketplace: 'https://stag-marketplace.poriverse.io',
            linkPori2D: 'https://stag-porian-photo.vinaweb.app',
            linkPori3D: 'https://po-model.vinaweb.app/index.html',
            token: {
                nativeSymbol: 'RIKEN',
                nativeAddress: '0xc78cd7A12D73B3021CDB3Bffb8230065118D3b47',
                nativeDecimal: '18',
                nativeId: 'crabada',
                inGameSymbol: 'RIGY',
                inGameAddress: '0xB9C88958806a187a6626A5B22089E3d3909415aa',
                inGameDecimal: '18',
                inGameId: 'treasure-under-sea',
                fragmentSymbol: 'FRAGMENT',
                fragmentAddress: '0x37a0318c36D38724fD3b193BF2D6bAD3498A67e3',
                fragmentDecimal: '18',
            },
            scCreatedBlock: {
                idle: 25777543,
            },
            contractAddress: {
                PoriNFTBreedable: '0xe958F64556f7293D882E7a3E7330546F9Ea75182',
                poriBreedingRule: '0x066aB3B4817514a86cf91433dfF8C5bC2c666FDf',
                marketplaceAddress: '0x4831013ac926366e856140548692e4e2B4799Bfa',
                rentalAddress: '0xEa5ee287DE00112b427f96eCe8d2725EA2BfEf41',
                idleGameAddress: '0x70d66d12c424Db41bf4E501A3FBbF5D4a779E66b',
                multicallAddress: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
            },
            rpcMetamask: {
                chainId: '80001',
            },
        },
    },
    n: {
        chainId: '0x13881',
        chainName: 'Mumbai-Testnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: ['https://rpc-mumbai.vinaweb.app'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    },
    b: {
        Terra: '1',
        Aqua: '2',
        Magica: '3',
        Mecha: '4',
        Ancia: '5',
        Stellar: '6',
        Mysteria: '7',
    },
    l: {
        Egg: 1,
        Adult: 2,
    },
    k: {
        Origin: 2,
        Genesis: 1,
    },
    a: {
        ForSale: 1,
        ForRent: 2,
        Renting: 3,
        Available: 4,
        InGameChapter1: 5,
    },
    c: {
        selectClass: '',
        sortPower: 'minePower',
        sortOrder: 'asc',
    },
    d: 7955107200,
    g: {
        ExploreMission: 1,
        AssitMission: 2,
        CanAssitMission: 3,
    },
    f: {
        Explore: 'Explore',
        Assit: 'Assit',
        Fortify1: 3,
        Fortify2: 4,
        Finish: 100,
    },
    i: {
        Explore: 3,
        Assit: 3,
        Fortify1: 1,
        Fortify2: 1,
        Finish: 100,
    },
    h: {
        Explore: 'Explore',
        Assit: 'Assit',
    },
    j: {
        Explore: 'Explore',
        Supported1: 'Supported1',
        Fortify1: 'Fortify1',
        Supported2: 'Supported2',
    },
    e: {
        Unknown: 0,
        Started: 1,
        Supported1: 2,
        Fortified1: 3,
        Supported2: 4,
        Finished: 5,
    },
};


/***/ }),

/***/ "./packages/pori-repositories/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Services = exports.SchedulerService = exports.SchedulerRepo = exports.ScheduleJobModel = exports.DataViewRepo = exports.DataViewModel = exports.PoriDataModel = exports.PoriRepo = exports.PlayerDataModel = exports.PlayerRepo = exports.IdleGameSCEventRepo = exports.IdleGameSCMetadataRepo = exports.IdleGameSCEventDataModel = exports.IdleGameSCMetadataDataModel = exports.openRepo = void 0;
const tslib_1 = __webpack_require__("tslib");
const realm_1 = tslib_1.__importDefault(__webpack_require__("realm"));
const schema_1 = __webpack_require__("./packages/pori-repositories/src/lib/idleGames/schema.ts");
const schema_2 = __webpack_require__("./packages/pori-repositories/src/lib/idleGames/schema.ts");
Object.defineProperty(exports, "IdleGameSCMetadataRepo", ({ enumerable: true, get: function () { return schema_2.IdleGameSCMetadataRepo; } }));
Object.defineProperty(exports, "IdleGameSCMetadataDataModel", ({ enumerable: true, get: function () { return schema_2.IdleGameSCMetadataDataModel; } }));
Object.defineProperty(exports, "IdleGameSCEventRepo", ({ enumerable: true, get: function () { return schema_2.IdleGameSCEventRepo; } }));
Object.defineProperty(exports, "IdleGameSCEventDataModel", ({ enumerable: true, get: function () { return schema_2.IdleGameSCEventDataModel; } }));
Object.defineProperty(exports, "PlayerRepo", ({ enumerable: true, get: function () { return schema_2.PlayerRepo; } }));
Object.defineProperty(exports, "PlayerDataModel", ({ enumerable: true, get: function () { return schema_2.PlayerDataModel; } }));
Object.defineProperty(exports, "PoriRepo", ({ enumerable: true, get: function () { return schema_2.PoriRepo; } }));
Object.defineProperty(exports, "PoriDataModel", ({ enumerable: true, get: function () { return schema_2.PoriDataModel; } }));
Object.defineProperty(exports, "DataViewModel", ({ enumerable: true, get: function () { return schema_2.DataViewModel; } }));
Object.defineProperty(exports, "DataViewRepo", ({ enumerable: true, get: function () { return schema_2.DataViewRepo; } }));
const scheduler_1 = __webpack_require__("./packages/pori-repositories/src/lib/services/scheduler.ts");
Object.defineProperty(exports, "ScheduleJobModel", ({ enumerable: true, get: function () { return scheduler_1.ScheduleJobModel; } }));
Object.defineProperty(exports, "SchedulerRepo", ({ enumerable: true, get: function () { return scheduler_1.SchedulerRepo; } }));
Object.defineProperty(exports, "SchedulerService", ({ enumerable: true, get: function () { return scheduler_1.SchedulerService; } }));
async function openRepo(opt) {
    var _a;
    const schemas = (_a = opt.schema) !== null && _a !== void 0 ? _a : [];
    const ins = await realm_1.default.open({
        ...opt,
        schemaVersion: 3,
        schema: [...schemas, ...schema_1.Schemas, ...scheduler_1.SchedulerServiceSchema],
        shouldCompactOnLaunch: () => true,
    });
    return ins;
}
exports.openRepo = openRepo;
const Services = {
    SchedulerService: scheduler_1.SchedulerService,
};
exports.Services = Services;


/***/ }),

/***/ "./packages/pori-repositories/src/lib/common/baseDataModel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonReamRepo = void 0;
const tslib_1 = __webpack_require__("tslib");
const realm_1 = tslib_1.__importDefault(__webpack_require__("realm"));
function CommonReamRepo(MODEL_NAME) {
    return class Wrapper {
        static async findOne(realm, id) {
            const res = realm.objectForPrimaryKey(MODEL_NAME, id);
            return res;
        }
        static findOneSync(realm, id) {
            const res = realm.objectForPrimaryKey(MODEL_NAME, id);
            return res;
        }
        static async findAll(realm) {
            return realm.objects(MODEL_NAME);
        }
        static create(realm, data) {
            return realm.create(MODEL_NAME, { ...data }, realm_1.default.UpdateMode.Modified);
        }
        static getOrCreate(realm, id, defaultData) {
            const res = realm.objectForPrimaryKey(MODEL_NAME, id);
            if (res) {
                return res;
            }
            return Wrapper.create(realm, { ...defaultData, _id: id });
        }
        static async createWithTx(realm, data) {
            return new Promise((resolve, reject) => {
                try {
                    realm.write(() => {
                        const res = realm.create(MODEL_NAME, { ...data }, realm_1.default.UpdateMode.Modified);
                        resolve(res);
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        }
        static async upsertWithTx(realm, id, val) {
            return new Promise((resolve, reject) => {
                try {
                    const res = realm.objectForPrimaryKey(MODEL_NAME, id);
                    if (res) {
                        const mergedData = { ...res.toJSON(), ...val };
                        return Wrapper.createWithTx(realm, mergedData)
                            .then(resolve)
                            .catch(reject);
                    }
                    return Wrapper.createWithTx(realm, { ...val, _id: id })
                        .then(resolve)
                        .catch(reject);
                }
                catch (error) {
                    return reject(error);
                }
            });
        }
        static async getOrCreateWithTx(realm, id, defaultData) {
            return new Promise((resolve, reject) => {
                try {
                    const res = realm.objectForPrimaryKey(MODEL_NAME, id);
                    if (res) {
                        return resolve(res);
                    }
                    return Wrapper.createWithTx(realm, { ...defaultData, _id: id })
                        .then(resolve)
                        .catch(reject);
                }
                catch (error) {
                    return reject(error);
                }
            });
        }
        static async tx(realm, handler) {
            return new Promise((resolve, reject) => {
                realm.write(() => {
                    try {
                        handler();
                        resolve();
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        }
        static txSync(realm, handler) {
            realm.write(() => {
                handler();
            });
        }
    };
}
exports.CommonReamRepo = CommonReamRepo;


/***/ }),

/***/ "./packages/pori-repositories/src/lib/idleGames/game.schema.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataViewRepo = exports.DataViewModel = exports.PoriRepo = exports.PoriDataModel = exports.PlayerRepo = exports.PlayerDataModel = void 0;
const tslib_1 = __webpack_require__("tslib");
const realm_1 = tslib_1.__importDefault(__webpack_require__("realm"));
const baseDataModel_1 = __webpack_require__("./packages/pori-repositories/src/lib/common/baseDataModel.ts");
// -------------------------------------------------
//  Players
// -------------------------------------------------
class PlayerDataModel extends realm_1.default.Object {
    constructor(_id, createdBlock, pories) {
        super();
        this._id = _id;
        this.createdBlock = createdBlock;
        this.pories = pories;
    }
    static generate(_id, createdBlock) {
        return {
            _id,
            createdBlock,
        };
    }
}
exports.PlayerDataModel = PlayerDataModel;
PlayerDataModel.NAME = 'Players';
PlayerDataModel.schema = {
    name: PlayerDataModel.NAME,
    primaryKey: '_id',
    properties: {
        _id: 'string',
        createdBlock: 'int',
        pories: 'Pories[]',
    },
};
exports.PlayerRepo = (0, baseDataModel_1.CommonReamRepo)(PlayerDataModel.NAME);
// -------------------------------------------------
//  Pori
// -------------------------------------------------
class PoriDataModel extends realm_1.default.Object {
    constructor(_id, 
    // deposit to IdleGame
    isActive, 
    // nftInfo
    type, name, dna, status, poriClass, legend, purity, birthDate, ownerAddress, stage, health, speed, physicalAttack, physicalDefend, critical, magicAttack, magicDefend, minePower, helpPower, createdAt, updatedAt, 
    // link
    player) {
        super();
        this._id = _id;
        this.isActive = isActive;
        this.type = type;
        this.name = name;
        this.dna = dna;
        this.status = status;
        this.poriClass = poriClass;
        this.legend = legend;
        this.purity = purity;
        this.birthDate = birthDate;
        this.ownerAddress = ownerAddress;
        this.stage = stage;
        this.health = health;
        this.speed = speed;
        this.physicalAttack = physicalAttack;
        this.physicalDefend = physicalDefend;
        this.critical = critical;
        this.magicAttack = magicAttack;
        this.magicDefend = magicDefend;
        this.minePower = minePower;
        this.helpPower = helpPower;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.player = player;
    }
    static generate(info) {
        const { tokenId, type, name, dna, status, poriClass, legend, purity, birthDate, ownerAddress, stage, health, speed, physicalAttack, physicalDefend, critical, magicAttack, magicDefend, minePower, helpPower, createdAt, updatedAt, } = info;
        return {
            _id: tokenId,
            isActive: true,
            // nftInfo
            type,
            name,
            dna,
            status,
            poriClass,
            legend,
            purity,
            birthDate,
            ownerAddress,
            stage,
            health,
            speed,
            physicalAttack,
            physicalDefend,
            critical,
            magicAttack,
            magicDefend,
            minePower,
            helpPower,
            createdAt,
            updatedAt,
        };
    }
}
exports.PoriDataModel = PoriDataModel;
PoriDataModel.NAME = 'Pories';
PoriDataModel.schema = {
    name: PoriDataModel.NAME,
    primaryKey: '_id',
    properties: {
        _id: 'int',
        isActive: 'bool',
        // nftInfo
        type: 'int?',
        name: 'string?',
        dna: 'string?',
        status: 'int?',
        poriClass: 'int?',
        legend: 'int?',
        purity: 'int?',
        birthDate: 'string?',
        ownerAddress: 'string?',
        stage: 'int?',
        health: 'int?',
        speed: 'int?',
        physicalAttack: 'int?',
        physicalDefend: 'int?',
        critical: 'int?',
        magicAttack: 'int?',
        magicDefend: 'int?',
        minePower: 'int?',
        helpPower: 'int?',
        createdAt: 'string?',
        updatedAt: 'string?',
        player: {
            type: 'linkingObjects',
            objectType: PlayerDataModel.NAME,
            property: 'pories',
        },
    },
};
exports.PoriRepo = (0, baseDataModel_1.CommonReamRepo)(PoriDataModel.NAME);
// -------------------------------------------------
//  Players
// -------------------------------------------------
class DataViewModel extends realm_1.default.Object {
    constructor(_id, cursor, _v, data) {
        super();
        this._id = _id;
        this.cursor = cursor;
        this._v = _v;
        this.data = data;
    }
    static generate(_id, cursor, data, version = '1') {
        return {
            _id,
            cursor,
            _v: version,
            data: JSON.stringify(data),
        };
    }
}
exports.DataViewModel = DataViewModel;
DataViewModel.NAME = 'DataView';
DataViewModel.schema = {
    name: DataViewModel.NAME,
    primaryKey: '_id',
    properties: {
        _id: 'string',
        cursor: 'string',
        _v: 'string',
        data: 'string',
    },
};
exports.DataViewRepo = (0, baseDataModel_1.CommonReamRepo)(DataViewModel.NAME);


/***/ }),

/***/ "./packages/pori-repositories/src/lib/idleGames/scInfo.schema.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdleGameSCMetadataRepo = exports.IdleGameSCMetadataDataModel = exports.IdleGameSCEventRepo = exports.IdleGameSCEventDataModel = void 0;
const tslib_1 = __webpack_require__("tslib");
const realm_1 = tslib_1.__importDefault(__webpack_require__("realm"));
const baseDataModel_1 = __webpack_require__("./packages/pori-repositories/src/lib/common/baseDataModel.ts");
const { ObjectID } = realm_1.default.BSON;
// -------------------------------------------------
//  SC.Events
// -------------------------------------------------
class IdleGameSCEventDataModel extends realm_1.default.Object {
    constructor(_id = new ObjectID(), type, txHash, blockNo, data) {
        super();
        this._id = _id;
        this.type = type;
        this.txHash = txHash;
        this.blockNo = blockNo;
        this.data = data;
    }
    static generate({ type, txHash, blockNo, data }) {
        return {
            _id: new ObjectID(),
            type,
            txHash,
            blockNo,
            data,
        };
    }
}
exports.IdleGameSCEventDataModel = IdleGameSCEventDataModel;
IdleGameSCEventDataModel.NAME = 'IdleGame.SCEvents';
IdleGameSCEventDataModel.schema = {
    name: IdleGameSCEventDataModel.NAME,
    primaryKey: '_id',
    properties: {
        _id: 'objectId',
        type: 'string',
        txHash: 'string',
        blockNo: 'int',
        data: 'IdleGame.SCEvents.EventPayload',
    },
};
IdleGameSCEventDataModel.embededEventDataSchema = {
    name: 'IdleGame.SCEvents.EventPayload',
    embedded: true,
    properties: {
        mineId: 'int?',
        farmer: 'string?',
        startTime: 'int?',
        porians: {
            type: 'list',
            objectType: 'int',
            optional: true,
        },
        indexes: {
            type: 'list',
            objectType: 'int',
            optional: true,
        },
        winner: 'string?',
        fragments: 'int?',
        farmerReward1: 'decimal128?',
        farmerReward2: 'decimal128?',
        helperReward1: 'decimal128?',
        helperReward2: 'decimal128?',
        porian: 'int?',
        index: 'int?',
        rewardLevel: 'int?',
        blockedTime: 'int?',
        helper: 'string?',
        rewardLevels: {
            type: 'list',
            objectType: 'int',
            optional: true,
        },
        from: 'string?',
        expiredAt: 'int?',
        to: 'string?',
        adventureDuration: 'int?',
        turnDuration: 'int?',
    },
};
exports.IdleGameSCEventRepo = (0, baseDataModel_1.CommonReamRepo)(IdleGameSCEventDataModel.NAME);
// -------------------------------------------------
//  SC.Metadata
// -------------------------------------------------
class IdleGameSCMetadataDataModel extends realm_1.default.Object {
    constructor(_id, createdBlock, updatedBlock, extras = {}) {
        super();
        this._id = _id;
        this.createdBlock = createdBlock;
        this.updatedBlock = updatedBlock;
        this.extras = extras;
    }
}
exports.IdleGameSCMetadataDataModel = IdleGameSCMetadataDataModel;
IdleGameSCMetadataDataModel.NAME = 'IdleGame.Metadata';
IdleGameSCMetadataDataModel.schema = {
    name: IdleGameSCMetadataDataModel.NAME,
    primaryKey: '_id',
    properties: {
        _id: 'string',
        createdBlock: 'int',
        updatedBlock: 'int',
        extras: '{}',
    },
};
exports.IdleGameSCMetadataRepo = (0, baseDataModel_1.CommonReamRepo)(IdleGameSCMetadataDataModel.NAME);


/***/ }),

/***/ "./packages/pori-repositories/src/lib/idleGames/schema.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Schemas = void 0;
const tslib_1 = __webpack_require__("tslib");
const scInfo_schema_1 = __webpack_require__("./packages/pori-repositories/src/lib/idleGames/scInfo.schema.ts");
const game_schema_1 = __webpack_require__("./packages/pori-repositories/src/lib/idleGames/game.schema.ts");
tslib_1.__exportStar(__webpack_require__("./packages/pori-repositories/src/lib/idleGames/scInfo.schema.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/pori-repositories/src/lib/idleGames/game.schema.ts"), exports);
exports.Schemas = [
    scInfo_schema_1.IdleGameSCEventDataModel.schema,
    scInfo_schema_1.IdleGameSCMetadataDataModel.schema,
    scInfo_schema_1.IdleGameSCEventDataModel.embededEventDataSchema,
    game_schema_1.PlayerDataModel.schema,
    game_schema_1.PoriDataModel.schema,
    game_schema_1.DataViewModel.schema,
];


/***/ }),

/***/ "./packages/pori-repositories/src/lib/services/scheduler.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulerService = exports.SchedulerServiceSchema = exports.SchedulerRepo = exports.ScheduleJobModel = void 0;
const tslib_1 = __webpack_require__("tslib");
const debug_1 = tslib_1.__importDefault(__webpack_require__("debug"));
const realm_1 = tslib_1.__importDefault(__webpack_require__("realm"));
const baseDataModel_1 = __webpack_require__("./packages/pori-repositories/src/lib/common/baseDataModel.ts");
const { ObjectID } = realm_1.default.BSON;
const debugLog = (0, debug_1.default)('pori:services:scheduler');
// -------------------------------------------------
//  Scheduler
// -------------------------------------------------
class ScheduleJobModel extends realm_1.default.Object {
    constructor() {
        super(...arguments);
        this._id = '';
        this.type = '';
        this.codeName = '';
        this.params = '';
        this.runAt = new Date();
        this.hasFinish = false;
        this.result = '';
    }
    static generate(codeName, params, runAt, _id = new ObjectID().toHexString()) {
        return {
            _id,
            type: 'SCHEDULE',
            codeName,
            params,
            runAt,
            hasFinish: false,
        };
    }
}
exports.ScheduleJobModel = ScheduleJobModel;
ScheduleJobModel.NAME = 'Schedulers';
ScheduleJobModel.schema = {
    name: ScheduleJobModel.NAME,
    primaryKey: '_id',
    properties: {
        _id: 'string',
        hasFinish: 'bool',
        type: 'string',
        codeName: 'string',
        params: 'string?',
        runAt: 'date?',
        result: 'string?',
    },
};
exports.SchedulerRepo = (0, baseDataModel_1.CommonReamRepo)(ScheduleJobModel.NAME);
exports.SchedulerServiceSchema = [ScheduleJobModel];
class SchedulerService {
    constructor() {
        this.jobHandlers = {};
        this.timerTickets = {};
    }
    addHandler(name, func) {
        this.jobHandlers[name] = func;
    }
    async start(realm) {
        await this.refreshAllJob(realm);
    }
    async stop(realm) {
        for (const [k, v] of Object.entries(this.timerTickets)) {
            clearTimeout(v);
        }
    }
    async getJobById(realm, jobId) {
        const ins = await exports.SchedulerRepo.findOne(realm, jobId);
        if (!ins)
            return;
        return ins;
    }
    async deleteJob(realm, jobId) {
        const ins = await exports.SchedulerRepo.findOne(realm, jobId);
        if (!ins)
            return;
        exports.SchedulerRepo.txSync(realm, () => {
            const ticketId = ins._id;
            delete this.timerTickets[ticketId];
            realm.delete(ins);
        });
    }
    async scheduleJob(realm, { codeName, params, runAt, _id, }) {
        const ins = await exports.SchedulerRepo.createWithTx(realm, ScheduleJobModel.generate(codeName, params, runAt, _id));
        await this.internalRegisterJob(realm, ins);
        return ins._id;
    }
    async refreshAllJob(realm) {
        const availableJobs = await this.listPendingJob(realm);
        for (const iterator of availableJobs) {
            await this.internalRegisterJob(realm, iterator);
        }
    }
    async listPendingJob(realm) {
        const now = new Date();
        const availableJobs = (await exports.SchedulerRepo.findAll(realm)).filtered(`runAt >= $0 && hasFinish = false`, now);
        return availableJobs;
    }
    async internalRegisterJob(realm, iterator) {
        const now = new Date();
        const { _id, runAt, codeName } = iterator;
        const ticketId = _id;
        if (this.timerTickets[ticketId]) {
            clearTimeout(this.timerTickets[ticketId]);
        }
        const intervalMs = runAt.valueOf() - now.valueOf();
        this.timerTickets[_id] = setTimeout(this.execJob(realm, ticketId), intervalMs);
    }
    execJob(realm, jobId) {
        return async () => {
            debugLog(`[scheduler] job id run ${jobId}`);
            const ins = await exports.SchedulerRepo.findOne(realm, jobId);
            if (!ins)
                return;
            const codeName = ins.codeName;
            const params = ins.params;
            debugLog(`[scheduler] job id run ${jobId}. codeName ${codeName}, params ${params}`);
            let result = '';
            try {
                const func = this.jobHandlers[codeName];
                if (!func) {
                    result = `[error] missing handler for codeName ${codeName}`;
                    debugLog(`[scheduler] job id run ${jobId}. missing handler for codeName ${codeName}`);
                    return;
                }
                result = await func(ins);
            }
            catch (error) {
                result = `[error] ${error.message}`;
                console.error(`[scheduler] job id run ${jobId}. error ${error.message}`);
            }
            finally {
                delete this.timerTickets[jobId];
                exports.SchedulerRepo.txSync(realm, () => {
                    ins.hasFinish = true;
                    ins.result = result;
                });
            }
        };
    }
}
exports.SchedulerService = SchedulerService;


/***/ }),

/***/ "./packages/utils/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./packages/utils/src/lib/axiosHelper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/utils/src/lib/typeConvertHelper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/utils/src/lib/cryptoHelper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/utils/src/lib/deferred.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/utils/src/lib/functionHelper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./packages/utils/src/lib/jobQueue.ts"), exports);


/***/ }),

/***/ "./packages/utils/src/lib/axiosHelper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.axiosIns = void 0;
const axios_1 = __webpack_require__("axios");
const axiosIns = new axios_1.Axios({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    },
});
exports.axiosIns = axiosIns;


/***/ }),

/***/ "./packages/utils/src/lib/cryptoHelper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decryptAes = exports.encryptAes = exports.generateAesIv = exports.generateAesKey = void 0;
const tslib_1 = __webpack_require__("tslib");
const crypto_1 = tslib_1.__importDefault(__webpack_require__("crypto"));
const algo = 'aes-256-cbc';
function generateAesKey(pass) {
    const salt = crypto_1.default.randomBytes(16);
    const keyLengthBytes = 256 / 8;
    const key = crypto_1.default.scryptSync(pass, salt, keyLengthBytes);
    return { key, algo };
}
exports.generateAesKey = generateAesKey;
function generateAesIv() {
    const iv = crypto_1.default.randomBytes(16);
    return iv;
}
exports.generateAesIv = generateAesIv;
async function encryptAes({ key, iv, data, }) {
    return new Promise((resolve, reject) => {
        const cipher = crypto_1.default.createCipheriv(algo, key, iv);
        let encrypted = '';
        cipher.on('readable', () => {
            let chunk;
            while (null !== (chunk = cipher.read())) {
                encrypted += chunk.toString('hex');
            }
        });
        cipher.on('end', () => {
            resolve(encrypted);
        });
        cipher.on('error', (err) => {
            reject(err);
        });
        cipher.write(data);
        cipher.end();
    });
}
exports.encryptAes = encryptAes;
async function decryptAes({ key, iv, encrypted, }) {
    return new Promise((resolve, reject) => {
        const decipher = crypto_1.default.createDecipheriv(algo, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        resolve(decrypted);
    });
}
exports.decryptAes = decryptAes;


/***/ }),

/***/ "./packages/utils/src/lib/deferred.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Deferred = void 0;
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
    reset() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
exports.Deferred = Deferred;


/***/ }),

/***/ "./packages/utils/src/lib/functionHelper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.minIndexBy = exports.minIndex = exports.splitPackedHexBy32Bytes = exports.hexToBytes = exports.isHexStrict = exports.byte2number = exports.isArrayIncludeAll = exports.boolFromString = exports.doTaskWithRetry = exports.waitForMs = void 0;
const lodash_1 = __webpack_require__("lodash");
const waitForMs = (ms) => new Promise((r) => setTimeout(r, ms));
exports.waitForMs = waitForMs;
async function doTaskWithRetry(times, doTask, onRetry, delayMs) {
    let it = times;
    while (it > 0) {
        try {
            await doTask();
            return;
        }
        catch (error) {
            it--;
            const canRetry = it > 0;
            if (!canRetry)
                throw error;
            onRetry && onRetry(error, times - it);
            if (delayMs)
                await (0, exports.waitForMs)(delayMs);
        }
    }
}
exports.doTaskWithRetry = doTaskWithRetry;
function boolFromString(inp) {
    if (inp === '1' || inp === 'true')
        return true;
    return false;
}
exports.boolFromString = boolFromString;
function isArrayIncludeAll(array, contain) {
    for (const itm of contain) {
        if (!array.includes(itm))
            return false;
    }
    return true;
}
exports.isArrayIncludeAll = isArrayIncludeAll;
function byte2number(bytes) {
    return parseInt(Buffer.from(bytes).toString('hex'), 16);
}
exports.byte2number = byte2number;
function isHexStrict(hex) {
    return ((typeof hex === 'string' || typeof hex === 'number') &&
        /^(-)?0x[0-9a-f]*$/i.test(hex));
}
exports.isHexStrict = isHexStrict;
function hexToBytes(hex) {
    hex = hex.toString(16);
    if (!isHexStrict(hex)) {
        throw new Error('Given value "' + hex + '" is not a valid hex string.');
    }
    hex = hex.replace(/^0x/i, '');
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.slice(c, c + 2), 16));
    return bytes;
}
exports.hexToBytes = hexToBytes;
function splitPackedHexBy32Bytes(hex) {
    hex = hex.replace(/^0x/i, '');
    const fixedSize = 64;
    const res = [];
    for (let i = 0; i < hex.length; i += fixedSize) {
        const chunk = hex.slice(i, i + fixedSize);
        res.push(chunk);
    }
    return res;
}
exports.splitPackedHexBy32Bytes = splitPackedHexBy32Bytes;
function minIndex(arr) {
    const res = (0, lodash_1.minBy)(Object.entries(arr), (itm) => itm[1]);
    if (!res)
        return null;
    return {
        minVal: res[1],
        minIndex: res[0],
    };
}
exports.minIndex = minIndex;
function minIndexBy(arr, byFunc) {
    const res = (0, lodash_1.minBy)(Object.entries(arr), (itm) => byFunc(itm));
    if (!res)
        return null;
    return {
        minVal: res[1],
        minIndex: res[0],
    };
}
exports.minIndexBy = minIndexBy;


/***/ }),

/***/ "./packages/utils/src/lib/jobQueue.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JobQueue = void 0;
const deferred_1 = __webpack_require__("./packages/utils/src/lib/deferred.ts");
class JobQueue {
    constructor() {
        this._queue = [];
        this.isProcessing = false;
    }
    addJob(exeFunc) {
        const def = new deferred_1.Deferred();
        this._queue.push({
            def,
            exeFunc,
        });
        this._checkJob();
        return def.promise;
    }
    _checkJob() {
        if (this.isProcessing)
            return;
        if (this._queue.length <= 0)
            return;
        const itm = this._queue.shift();
        this._exeJob(itm);
    }
    async _exeJob({ def, exeFunc }) {
        try {
            this.isProcessing = true;
            const res = await exeFunc();
            def.resolve(res);
        }
        catch (error) {
            def.reject(error);
        }
        finally {
            this.isProcessing = false;
            this._checkJob();
        }
    }
}
exports.JobQueue = JobQueue;


/***/ }),

/***/ "./packages/utils/src/lib/typeConvertHelper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transformArrayElementToNumber = exports.toDecimal128 = exports.toNumber = void 0;
const tslib_1 = __webpack_require__("tslib");
const realm_1 = tslib_1.__importDefault(__webpack_require__("realm"));
function toNumber(val) {
    return parseFloat(val);
}
exports.toNumber = toNumber;
function toDecimal128(val) {
    return realm_1.default.BSON.Decimal128.fromString(val);
}
exports.toDecimal128 = toDecimal128;
function transformArrayElementToNumber(val) {
    return val.map((itm) => toNumber(itm));
}
exports.transformArrayElementToNumber = transformArrayElementToNumber;


/***/ }),

/***/ "@dynamic-amm/sdk":
/***/ ((module) => {

module.exports = require("@dynamic-amm/sdk");

/***/ }),

/***/ "@ethersproject/providers":
/***/ ((module) => {

module.exports = require("@ethersproject/providers");

/***/ }),

/***/ "@walletconnect/client":
/***/ ((module) => {

module.exports = require("@walletconnect/client");

/***/ }),

/***/ "@walletconnect/qrcode-modal":
/***/ ((module) => {

module.exports = require("@walletconnect/qrcode-modal");

/***/ }),

/***/ "axios":
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "debug":
/***/ ((module) => {

module.exports = require("debug");

/***/ }),

/***/ "lodash":
/***/ ((module) => {

module.exports = require("lodash");

/***/ }),

/***/ "moment":
/***/ ((module) => {

module.exports = require("moment");

/***/ }),

/***/ "mongodb":
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ "realm":
/***/ ((module) => {

module.exports = require("realm");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "util":
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "web3":
/***/ ((module) => {

module.exports = require("web3");

/***/ }),

/***/ "crypto":
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "repl":
/***/ ((module) => {

module.exports = require("repl");

/***/ }),

/***/ "stream":
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/***/ ((module) => {

module.exports = require("url");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const MongoDataStore = tslib_1.__importStar(__webpack_require__("./packages/mongodb-data-store/src/index.ts"));
const pori_actions_1 = __webpack_require__("./packages/pori-actions/src/index.ts");
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const Repos = tslib_1.__importStar(__webpack_require__("./packages/pori-repositories/src/index.ts"));
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const fs_1 = __webpack_require__("fs");
const os_1 = tslib_1.__importDefault(__webpack_require__("os"));
const repl_1 = tslib_1.__importDefault(__webpack_require__("repl"));
const config_1 = __webpack_require__("./packages/examples/cli/src/app/config.ts");
const AppEnv = tslib_1.__importStar(__webpack_require__("./packages/examples/cli/src/environments/environment.ts"));
const AppEnvProd = tslib_1.__importStar(__webpack_require__("./packages/examples/cli/src/environments/environment.prod.ts"));
const AppEnvProdPorichain = tslib_1.__importStar(__webpack_require__("./packages/examples/cli/src/environments/environment.prod.porichain.ts"));
let env = pori_metadata_1.ENV.ProdPorichain;
let activeEnv = computeActiveEnv(env);
let autoRunCommand = '';
let server;
function computeActiveEnv(env) {
    let activeEnv;
    switch (env) {
        case pori_metadata_1.ENV.Prod:
            activeEnv = AppEnvProd;
            break;
        case pori_metadata_1.ENV.ProdPorichain:
            activeEnv = AppEnvProdPorichain;
            break;
        case pori_metadata_1.ENV.Staging:
            activeEnv = AppEnv;
            break;
    }
    return activeEnv;
}
async function main() {
    for (let i = 0; i < process.argv.length; i++) {
        const element = process.argv[i];
        if (element === '--env')
            env = pori_metadata_1.ENV[process.argv[i + 1]];
        else if (element === '--cmd')
            autoRunCommand = process.argv[i + 1];
    }
    activeEnv = computeActiveEnv(env);
    console.log(env, activeEnv);
    if (!config_1.playerAddress) {
        console.log('missing process.env.PLAYER_ADDRESS');
        process.exit(1);
    }
    console.log('PlayerAddress:', config_1.playerAddress);
    console.log('Example: cli');
    const ctx = await (0, pori_actions_1.init)(env);
    console.log('connected');
    ctx.playerAddress = config_1.playerAddress;
    ctx.ui.writeMessage = async (msg) => {
        (0, config_1.loggerInfo)(msg);
    };
    if (activeEnv.environment.mongodbDataStoreUri) {
        MongoDataStore.addMongodbDataStore(ctx, activeEnv.environment.mongodbDataStoreUri, activeEnv.environment.mongodbDataStoreSSLCer);
    }
    let realm = await Repos.openRepo({
        path: activeEnv.environment.dbPath,
    });
    async function reloadRealm() {
        realm = await Repos.openRepo({
            path: activeEnv.environment.dbPath,
        });
        global.realm = realm;
    }
    const scheduler = new Repos.Services.SchedulerService();
    await scheduler.start(realm);
    global.realm = realm;
    global.ctx = ctx;
    global.Repos = Repos;
    global.Services = {
        scheduler,
    };
    global.Adventure = pori_actions_1.Adventure;
    global.test = pori_metadata_1.getMobileWalletApplink;
    server = repl_1.default.start({
        prompt: '>',
        useColors: true,
        useGlobal: true,
        terminal: true,
    });
    if (!config_1.noHistoryMode)
        server.setupHistory(process.env.NODE_REPL_HISTORY, () => {
            (0, config_1.loggerInfo)(`history stored at ${process.env.NODE_REPL_HISTORY}`);
        });
    //-----------------------------------------//
    // Cli Cmds
    //-----------------------------------------//
    server.defineCommand('exit', {
        help: 'Gracefull exit',
        action: async () => {
            console.log('shutting down....');
            await (0, pori_actions_1.close)(ctx);
            realm.close();
            console.log('bye!');
            process.exit(0);
        },
    });
    server.defineCommand('ci.uploadSnapshot', {
        help: 'ci script. updatedb + update snapshot',
        action: async () => {
            await doStats(realm, ctx);
            await doUploadSnapshot(realm, ctx);
            process.exit(0);
        },
    });
    server.defineCommand('storage.upload', {
        help: 'upload realm data to storage',
        action: async () => {
            await doUploadSnapshot(realm, ctx);
        },
    });
    server.defineCommand('storage.download', {
        help: 'upload realm data to storage',
        action: async () => {
            var _a;
            const backupKey = (0, pori_metadata_1.getDatastoreBackupKey)(env);
            console.log(`begin download - ${backupKey}`);
            const [fileMeta, dataStream] = await MongoDataStore.downloadBlob(ctx, backupKey);
            const totalBytes = fileMeta.length;
            let downloaded = 0;
            console.log(`metadata: revision:${(_a = fileMeta.metadata) === null || _a === void 0 ? void 0 : _a.revision}`);
            console.log('totalBytes', totalBytes);
            dataStream.prependListener('data', (chunk) => {
                downloaded += chunk.length;
                console.log('progress', downloaded / totalBytes);
            });
            dataStream
                .pipe((0, fs_1.createWriteStream)('./tmp/snapshot.realm'))
                .on('finish', async () => {
                console.log('finish');
                console.log('begin extract');
                realm.close();
                (0, fs_1.copyFileSync)('./tmp/snapshot.realm', activeEnv.environment.dbPath);
                console.log('extract success');
                await reloadRealm();
                console.log('reload realm success');
            });
        },
    });
    server.defineCommand('schedule.list', {
        help: 'List pending schedule',
        action: async () => {
            const jobs = await scheduler.listPendingJob(realm);
            console.log(jobs.map(({ _id, codeName, params, runAt }) => ({
                _id,
                runAt,
                codeName,
                params,
            })));
        },
    });
    server.defineCommand('schedule.create', {
        help: 'create schedule',
        action: async (args) => {
            var _a;
            const tmp = args.split(' ');
            const jobId = tmp[0];
            const codeName = tmp[1];
            const afterMs = parseInt(tmp[2]);
            const data = (_a = tmp[3]) !== null && _a !== void 0 ? _a : '';
            if (!codeName || Number.isNaN(afterMs)) {
                console.warn('\tUsage: schedule.create <id> <codeName> <afterMs> [data]');
                return;
            }
            await scheduler.scheduleJob(realm, {
                _id: jobId,
                codeName,
                params: data,
                runAt: new Date(Date.now() + afterMs),
            });
            const jobs = await scheduler.listPendingJob(realm);
            console.log(jobs.map(({ _id, codeName, params }) => ({ _id, codeName, params })));
        },
    });
    server.defineCommand('schedule.delete', {
        help: 'delete schedule',
        action: async (args) => {
            const id = args;
            await scheduler.deleteJob(realm, id);
            const jobs = await scheduler.listPendingJob(realm);
            console.log(jobs.map(({ _id, codeName, params }) => ({ _id, codeName, params })));
        },
    });
    server.defineCommand('genKey', {
        help: 'gen new aes Keypair',
        action: async () => {
            const { key, algo } = (0, utils_1.generateAesKey)('123');
            const iv = (0, utils_1.generateAesIv)();
            console.log(key.toString('hex'), iv.toString('hex'));
            (0, fs_1.writeFileSync)(activeEnv.environment.aesKeyPath, JSON.stringify({
                key: key.toString('hex'),
                iv: iv.toString('hex'),
                algo,
                genAt: new Date(),
            }));
        },
    });
    server.defineCommand('encData', {
        help: 'enc data',
        action: async (arg) => {
            if (!(0, fs_1.existsSync)(activeEnv.environment.aesKeyPath)) {
                console.error('key not found. need to run .genKey firse');
                return;
            }
            const keyObj = JSON.parse((0, fs_1.readFileSync)(activeEnv.environment.aesKeyPath).toString());
            const key = Buffer.from(keyObj.key, 'hex');
            const iv = Buffer.from(keyObj.iv, 'hex');
            console.log(`${arg} -> ${await (0, utils_1.encryptAes)({ key, iv, data: arg })}`);
        },
    });
    server.defineCommand('decData', {
        help: 'dec data',
        action: async (arg) => {
            if (!(0, fs_1.existsSync)(activeEnv.environment.aesKeyPath)) {
                console.error('key not found. need to run .genKey firse');
                return;
            }
            const keyObj = JSON.parse((0, fs_1.readFileSync)(activeEnv.environment.aesKeyPath).toString());
            const key = Buffer.from(keyObj.key, 'hex');
            const iv = Buffer.from(keyObj.iv, 'hex');
            console.log(`${arg} -> ${await (0, utils_1.decryptAes)({ key, iv, encrypted: arg })}`);
        },
    });
    server.defineCommand('test', {
        help: 'test',
        action: async () => {
            const res = await pori_actions_1.Adventure.getPoriansAtSCellSc(ctx, '52332');
            console.log(res);
            return res;
        },
    });
    server.defineCommand('sbattle', {
        help: 'test s battle',
        action: async (args) => {
            await pori_actions_1.Cmds.cmdDoSBattle({ ctx, realm, args });
        },
    });
    server.defineCommand('auto.list', {
        help: 'auto list',
        action: async () => {
            console.log(pori_actions_1.Auto.AutoPlayDb);
        },
    });
    server.defineCommand('auto.background_refresh', {
        help: 'auto background_refresh',
        action: async () => {
            await pori_actions_1.Auto.autoRefreshStatus({
                ctx,
                realm,
                playerAddress: config_1.playerAddress,
                args: { type: 'background_refresh', intervalMs: 2 * 60 * 1000 },
            });
        },
    });
    server.defineCommand('auto.all', {
        help: 'auto all',
        action: async () => {
            if (!ctx.walletAcc)
                return ctx.ui.writeMessage(`please call .wallet.unlock <.enveloped_key..> frist`);
            // update bot formations here
            for await (const iterator of config_1.RuntimeConfig.formations) {
                await pori_actions_1.Auto.autoPlayV1({
                    ctx,
                    realm,
                    playerAddress: config_1.playerAddress,
                    args: {
                        type: 'bot',
                        minePories: iterator.minePories,
                        supportPori: iterator.supportPori,
                        timeOutHours: config_1.RuntimeConfig.settings.botTimeoutHours,
                        usePortal: iterator.usePortal,
                    },
                });
                await (0, utils_1.waitForMs)(20000);
            }
            // background update db
            await pori_actions_1.Auto.autoRefreshStatus({
                ctx,
                realm,
                playerAddress: config_1.playerAddress,
                args: { type: 'background_refresh', intervalMs: 2 * 60 * 1000 },
            });
        },
    });
    server.defineCommand('bot.pull', {
        help: 'Bot Update KnowleageDB',
        action: async () => {
            console.log('updateKnowleage begin');
            await pori_actions_1.Input.updateEventDb(realm, ctx, {
                createdBlock: activeEnv.environment.createdBlock,
            });
            console.log('updateKnowleage end');
        },
    });
    server.defineCommand('gas', {
        help: 'calculate gasPrice',
        action: async () => {
            const web3GasPrice = await pori_actions_1.WalletActions.currentGasPrice({ ctx });
            console.log(ctx.web3.utils.fromWei(web3GasPrice, 'gwei'), 'gwei');
        },
    });
    server.defineCommand('price', {
        help: 'Kyberswap token price',
        action: async () => {
            const rigyPoolInfo = await (0, pori_actions_1.getKyberPoolRIGYPrice)({ ctx });
            const rikenPoolInfo = await (0, pori_actions_1.getKyberPoolRIKENPrice)({ ctx });
            const [lunaBusd, maticBusd] = await Promise.all([
                (0, pori_actions_1.queryBinancePrice)({ ctx, pair: 'LUNABUSD' }),
                (0, pori_actions_1.queryBinancePrice)({ ctx, pair: 'MATICBUSD' }),
            ]);
            console.log({
                ...rigyPoolInfo,
                ...rikenPoolInfo,
                'LUNA->BUSD': lunaBusd.price,
                'MATIC->BUSD': maticBusd.price,
            });
        },
    });
    server.defineCommand('market.pories', {
        help: 'marketplace pories',
        action: async () => {
            const sellingItems = await (0, pori_actions_1.queryMarketInfo)({ ctx });
            const shortList = await (0, pori_actions_1.expandEngadedMission)({
                ctx,
                data: sellingItems.slice(0, 10),
            });
            const marketplaceBaseUrl = (0, pori_metadata_1.getMarketplayBaseLink)(ctx.env);
            const formatedData = shortList.map((itm) => {
                const { tokenId, price, helpPower, minePower, numOfBreeds, maxOfBreeds, engagedMission, } = itm;
                return {
                    link: `${marketplaceBaseUrl}/pori/${tokenId}`,
                    price: (BigInt(price) / pori_metadata_1.TEN_POWER_10_BN).toString() + ' RIGY',
                    minePower,
                    helpPower,
                    engagedMission,
                    breed: `${numOfBreeds} / ${maxOfBreeds}`,
                };
            });
            console.log(formatedData);
        },
    });
    server.defineCommand('market.items', {
        help: 'marketplace items',
        action: async () => {
            const sellingItems = await (0, pori_actions_1.queryMarketItems)({ ctx, pageSize: 10 });
            const marketplaceBaseUrl = (0, pori_metadata_1.getMarketplayBaseLink)(ctx.env);
            const formatedData = sellingItems.map((itm) => {
                const { id, unitPrice, itemType, scOrderId } = itm;
                return {
                    link: `${marketplaceBaseUrl}/item-orders/${scOrderId}`,
                    name: itemType.name,
                    price: (BigInt(unitPrice) / pori_metadata_1.TEN_POWER_10_BN).toString() + ' RIGY',
                };
            });
            console.log(formatedData);
        },
    });
    server.defineCommand('stats', {
        help: 'Show my adv',
        action: async (addr) => {
            doStats(realm, ctx, addr);
        },
    });
    server.defineCommand('inv.list', {
        help: 'list all inventories',
        action: async (addr) => {
            const playerInfo = await Repos.PlayerRepo.findOne(realm, addr || config_1.playerAddress);
            const pories = await Promise.all(playerInfo.pories.map(async (itm) => {
                const { _id, minePower, helpPower } = itm;
                const engagedMission = await pori_actions_1.Adventure.queryMissiontOfPoriSc(ctx, _id);
                return {
                    id: _id,
                    minePower,
                    helpPower,
                    engagedMission,
                };
            }));
            const freeCheck = Object.fromEntries(pories.map((itm) => [itm.id, 1]));
            const teams = config_1.RuntimeConfig.formations.map((itm) => {
                const mine = itm.minePories.map((id) => pories.find((p) => p.id === +id));
                const support = pories.find((p) => p.id === +itm.supportPori);
                [...mine, support].forEach((p) => {
                    p && delete freeCheck[p.id];
                });
                const usePortal = itm.usePortal;
                return { mine, support, usePortal };
            });
            console.dir({ pories, teams, freeCheck }, { depth: 5 });
        },
    });
    server.defineCommand('wallet.reset', {
        help: 'Start walletconnect',
        action: async () => {
            console.warn('trying to reset wallet channel');
            ctx.walletConnectChannel = null;
            await (0, pori_actions_1.addWalletConnectToContext)(ctx, activeEnv.environment.walletConnectSessionStoragePath);
        },
    });
    server.defineCommand('wallet.unlock', {
        help: 'Start walletconnect',
        action: async (args) => {
            if (!(0, fs_1.existsSync)(activeEnv.environment.aesKeyPath)) {
                await ctx.ui.writeMessage('key not found. Please generate a new key + rebuild docker img...');
                return;
            }
            const keyObj = JSON.parse((0, fs_1.readFileSync)(activeEnv.environment.aesKeyPath).toString());
            const key = Buffer.from(keyObj.key, 'hex');
            const iv = Buffer.from(keyObj.iv, 'hex');
            let privKey = '';
            try {
                const encrypted = args;
                privKey = await (0, utils_1.decryptAes)({ key, iv, encrypted });
            }
            catch (error) {
                await ctx.ui.writeMessage('decrypt error...');
                return;
            }
            try {
                const acc = ctx.web3.eth.accounts.privateKeyToAccount(privKey);
                if (acc.address !== config_1.playerAddress)
                    throw new Error('not match playerAddress...');
                ctx.walletAcc = acc;
            }
            catch (error) {
                await ctx.ui.writeMessage(error.message);
                return;
            }
            await ctx.ui.writeMessage('wallet unlocked..');
        },
    });
    server.defineCommand('wallet.balance', {
        help: 'get wallet balance',
        action: async () => {
            const rigyInfo = (0, pori_metadata_1.getRIGYTokenInfo)(env);
            const rikenInfo = (0, pori_metadata_1.getRIKENTokenInfo)(env);
            // eslint-disable-next-line prefer-const
            let [RIGY, RIKEN, MATIC, priceInfo] = await Promise.all([
                (0, pori_actions_1.getTokenBalance)({
                    ctx,
                    erc20Address: rigyInfo.tokenAddress,
                    walletAddress: config_1.playerAddress,
                }),
                (0, pori_actions_1.getTokenBalance)({
                    ctx,
                    erc20Address: rikenInfo.tokenAddress,
                    walletAddress: config_1.playerAddress,
                }),
                (0, pori_actions_1.getMaticBalance)({ ctx, walletAddress: config_1.playerAddress }),
                (0, pori_actions_1.token2Usd)(ctx),
            ]);
            if (ctx.env === pori_metadata_1.ENV.ProdPorichain)
                RIGY = MATIC;
            console.log({
                RIGY,
                RIKEN,
                MATIC,
                RigyUsd: RIGY * priceInfo.rigy2Usd,
                RikenUsd: RIKEN * priceInfo.rken2Usd,
            });
        },
    });
    server.defineCommand('whoami', {
        help: 'whoami',
        action: async () => {
            const localMetadata = await getLocalRealmRevision(realm);
            const resp = `i am 🤖. 
  uptime: ${process.uptime()}
  pid: ${process.pid}
  hostname: ${os_1.default.hostname()}
  playerAddress: ${config_1.playerAddress}
  walletUnlock: ${Boolean(ctx.walletAcc)}
  settingGasFactor: ${ctx.setting.gasFactor} 
  realmRevision: ${localMetadata.revision}
  env: ${env}
    `;
            console.log(resp);
        },
    });
    //----------------------------------------------------//
    // Auto run ci support
    //----------------------------------------------------//
    if (autoRunCommand) {
        console.info('[cmd mode] Run cmd', autoRunCommand);
        server.write(`.${autoRunCommand}\n`);
    }
}
main();
async function getLocalRealmRevision(realm) {
    const dbMetadata = await Repos.IdleGameSCMetadataRepo.findOne(realm, 'default');
    const localMetadata = {
        revision: dbMetadata.updatedBlock,
    };
    return localMetadata;
}
async function doStats(realm, ctx, addr) {
    const humanView = await pori_actions_1.Computed.MyAdventure.refreshAdventureStatsForAddress({
        realm,
        ctx,
        options: { withGasPrice: true, withPortal: true, withPrice: true },
    }, addr || config_1.playerAddress);
    delete humanView.targets;
    delete humanView.note;
    humanView.protentialTarget = humanView.protentialTarget
        .slice(0, 5)
        .filter((itm) => !!itm);
    console.dir(humanView, { depth: 5 });
    const graphInfo = await pori_actions_1.Computed.MyAdventure.genLast7DaysGraphData({
        ctx,
        realm,
        playerAddress: addr || config_1.playerAddress,
    });
    console.log(graphInfo);
}
async function doUploadSnapshot(realm, ctx) {
    const stream = (0, fs_1.createReadStream)(activeEnv.environment.dbPath);
    const backupKey = (0, pori_metadata_1.getDatastoreBackupKey)(env);
    console.log(`upload snapshot - ${backupKey}`);
    const dbMetadata = await Repos.IdleGameSCMetadataRepo.findOne(realm, 'default');
    const metadata = {
        revision: dbMetadata.updatedBlock,
    };
    await MongoDataStore.waitForConnected(ctx);
    await MongoDataStore.storeBlob(ctx, backupKey, stream, metadata);
    console.log(`uploaded - revision:${metadata.revision}`);
}

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map