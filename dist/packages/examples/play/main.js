/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
const utils_1 = __webpack_require__("./packages/utils/src/index.ts");
const type_idleGame_1 = __webpack_require__("./packages/pori-metadata/src/lib/idleGameSc/type.idleGame.ts");
function parseIdleGameScEvent(eventInfo) {
    if (!type_idleGame_1.AllIdleGameEvents.includes(eventInfo.event))
        return null;
    let evType;
    let data;
    if (eventInfo.event)
        evType = eventInfo.event;
    else {
        const rawTopic = eventInfo.signature || eventInfo.raw.topics[0];
        console.log('aaaaa', rawTopic);
        evType = type_idleGame_1.IdleGameSCEventInvSignatureTable[rawTopic];
        if (!evType)
            return null;
    }
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
    console.log('hit raw data', rawData, (0, utils_1.hexToBytes)(rawData));
    return {
        mineId: 0,
        player: '',
        srcPorianIds: [],
        desPorianIds: [],
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
exports.ABI_IDLE = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"fragments","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"farmerReward2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"helperReward2","type":"uint256"}],"name":"AdventureFinished","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureFortified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"farmer","type":"address"},{"indexed":true,"internalType":"uint256","name":"startTime","type":"uint256"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"address","name":"helper","type":"address"},{"indexed":false,"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"indexed":false,"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"indexed":false,"internalType":"uint8[3]","name":"rewardLevels","type":"uint8[3]"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported1","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"mineId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"index","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"rewardLevel","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"blockedTime","type":"uint256"}],"name":"AdventureSupported2","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rate","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"FragmentConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"adventureDuration","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"turnDuration","type":"uint256"}],"name":"GameDurationChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"env","type":"uint8"}],"name":"GameEnvChanged","type":"event"},{"anonymous":false,"inputs":[],"name":"NoFragments","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"porianNFT","type":"address"},{"indexed":true,"internalType":"address","name":"porianPower","type":"address"},{"indexed":true,"internalType":"address","name":"rentalCentre","type":"address"}],"name":"PorianContractAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"expiredAt","type":"uint256"}],"name":"PorianDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"porian","type":"uint256"}],"name":"PorianWithdrawed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rentalFee","type":"uint256"},{"indexed":true,"internalType":"address","name":"reservePool","type":"address"}],"name":"RentalConfigsSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"rigyToken","type":"address"},{"indexed":false,"internalType":"address","name":"rikenToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"rigyReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rikenReward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"winRatio","type":"uint256"}],"name":"RewardConfigsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"rewardLevel","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"amountCell","type":"uint256"}],"name":"RewardLevelChanged","type":"event"},{"inputs":[],"name":"adventureDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"blockedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decreasedTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"env","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fragmentToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mechaDiscount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mines","outputs":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mission2Riken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianNFT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"porianPower","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"portalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"portalInfos","outputs":[{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint256","name":"supplied","type":"uint256"},{"internalType":"uint256","name":"locked","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rentalCentre","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rentalFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rentalPriceOf","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint128","name":"price","type":"uint128"},{"internalType":"uint128","name":"endTime","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reservePool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardLevels","outputs":[{"internalType":"uint256","name":"rewardRatio","type":"uint256"},{"internalType":"uint256","name":"amountCell","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rigyToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rikenToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFragments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"turnDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_adventureDuration","type":"uint256"},{"internalType":"uint256","name":"_turnDuration","type":"uint256"}],"name":"setGameDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setGameEnv","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[4]","name":"rewardRatios","type":"uint256[4]"},{"internalType":"uint256[4]","name":"amountCells","type":"uint256[4]"}],"name":"setRewardLevels","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_rigyToken","type":"address"},{"internalType":"address","name":"_rikenToken","type":"address"},{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"},{"internalType":"uint256","name":"_winRatio","type":"uint256"}],"name":"setRewardConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_porianNFT","type":"address"},{"internalType":"address","name":"_porianPower","type":"address"},{"internalType":"address","name":"_rentalCentre","type":"address"}],"name":"setPorianContractAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fragmentRate","type":"uint256"},{"internalType":"uint256","name":"_fragmentAmount","type":"uint256"},{"internalType":"address","name":"_fragmentToken","type":"address"}],"name":"setFragmentConfigs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawRiken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porian","type":"uint256"}],"name":"getOwnerNowOf","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"porian","type":"uint256"}],"name":"notExisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"expiredAt","type":"uint256"},{"internalType":"bytes12","name":"flags","type":"bytes12"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"onAuthorized","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"porians","type":"uint256[]"}],"name":"withdrawPorians","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"porianID","type":"uint256"},{"internalType":"uint256","name":"atTime","type":"uint256"}],"name":"getOwnerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"}],"name":"isMecha","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"startAdventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256[3]","name":"porians","type":"uint256[3]"},{"internalType":"uint8[3]","name":"indexes","type":"uint8[3]"},{"internalType":"bool","name":"notPortal","type":"bool"}],"name":"support1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"fortify","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"},{"internalType":"uint256","name":"porian","type":"uint256"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"support2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"mineId","type":"uint256"}],"name":"finish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"mission","type":"uint256"}],"name":"getPortalInfoOf","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"bytes12","name":"_selectedCells","type":"bytes12"}],"name":"_calculateNormalReward","outputs":[{"internalType":"uint256","name":"reward1","type":"uint256"},{"internalType":"uint256","name":"reward2","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"enum IdleGame.MiningState","name":"state","type":"uint8"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"farmer","type":"tuple"},{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bytes12","name":"selectedCells","type":"bytes12"},{"internalType":"uint128","name":"porianId1","type":"uint128"},{"internalType":"uint128","name":"porianId2","type":"uint128"}],"internalType":"struct IdleGame.PlayerInfo","name":"helper","type":"tuple"},{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"internalType":"struct IdleGame.MineInfo","name":"m","type":"tuple"},{"internalType":"uint8","name":"_env","type":"uint8"},{"internalType":"uint256","name":"fRigyReward","type":"uint256"},{"internalType":"uint256","name":"fRikenReward","type":"uint256"},{"internalType":"uint256","name":"hRigyReward","type":"uint256"},{"internalType":"uint256","name":"hRikenReward","type":"uint256"}],"name":"_calculateBigReward","outputs":[{"internalType":"address","name":"winner","type":"address"},{"internalType":"uint256","name":"fragments","type":"uint256"},{"internalType":"uint256","name":"fRigyRewardNew","type":"uint256"},{"internalType":"uint256","name":"fRikenRewardNew","type":"uint256"},{"internalType":"uint256","name":"hRigyRewardNew","type":"uint256"},{"internalType":"uint256","name":"hRikenRewardNew","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"atkPowerOf","outputs":[{"internalType":"uint256","name":"atkPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"defPowerOf","outputs":[{"internalType":"uint256","name":"defPower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"randomRewardLevel","outputs":[{"internalType":"uint8","name":"rewardLevel","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"},{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"name":"setRewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"getRewardInfo","outputs":[{"internalType":"uint8","name":"level","type":"uint8"},{"internalType":"uint8","name":"joined","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint8","name":"_env","type":"uint8"}],"name":"setEnv2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getEnvOf","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"},{"internalType":"uint64","name":"timestamp","type":"uint64"}],"name":"setStartTime2RewardMap","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"rewardMap","type":"bytes32"}],"name":"getStartTimeOfRewardMap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"mode","type":"uint256"}],"name":"getRewardOf","outputs":[{"internalType":"uint256","name":"_rigyReward","type":"uint256"},{"internalType":"uint256","name":"_rikenReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"ep","type":"uint256"},{"internalType":"uint256","name":"ap","type":"uint256"}],"name":"getESB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"rikenAmounts","type":"uint256[]"},{"internalType":"uint256","name":"_mechaDiscount","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missionLimit","type":"uint128"},{"internalType":"uint256","name":"_decreasedTime","type":"uint256"}],"name":"setRikenPortalConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"portalInfoOf","outputs":[{"internalType":"uint256","name":"suppliedRiken","type":"uint256"},{"internalType":"uint256","name":"lockedRiken","type":"uint256"},{"internalType":"uint256","name":"availableRiken","type":"uint256"},{"internalType":"uint256","name":"capacityRiken","type":"uint256"},{"internalType":"uint128","name":"missions","type":"uint128"},{"internalType":"uint128","name":"fastMissions","type":"uint128"},{"internalType":"uint128","name":"capacityMissions","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"missions","type":"uint256"},{"internalType":"bool","name":"_isMecha","type":"bool"}],"name":"getRikenAmount","outputs":[{"internalType":"uint256","name":"rikenAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"}],"name":"sqrt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"missionOfPori","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]');
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
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hexToBytes = exports.isHexStrict = exports.byte2number = exports.isArrayIncludeAll = exports.boolFromString = exports.doTaskWithRetry = exports.waitForMs = void 0;
const waitForMs = (ms) => new Promise((r) => setTimeout(r, ms));
exports.waitForMs = waitForMs;
async function doTaskWithRetry(times, doTask, onRetry) {
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

/***/ "axios":
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "lodash":
/***/ ((module) => {

module.exports = require("lodash");

/***/ }),

/***/ "realm":
/***/ ((module) => {

module.exports = require("realm");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "web3":
/***/ ((module) => {

module.exports = require("web3");

/***/ }),

/***/ "crypto":
/***/ ((module) => {

module.exports = require("crypto");

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
const pori_metadata_1 = __webpack_require__("./packages/pori-metadata/src/index.ts");
const web3_1 = tslib_1.__importDefault(__webpack_require__("web3"));
async function main() {
    const rpcUri = 'https://rpc1.porichain.io';
    const provider = new web3_1.default.providers.HttpProvider(rpcUri);
    const web3 = new web3_1.default(provider);
    const env = pori_metadata_1.ENV.ProdPorichain;
    const chainId = await web3.eth.getChainId();
    const idleGameSc = (0, pori_metadata_1.getIdleGameAddressSC)(env);
    const contract = new web3.eth.Contract(idleGameSc.abi, idleGameSc.address);
    console.log(contract.events['AdventureSupported2']);
    global.web3 = web3;
    // const server = repl.start({
    //   prompt: '>',
    //   useColors: true,
    //   useGlobal: true,
    //   terminal: true,
    // });
    // 0xc84a -> 51274
    // const res = await contract.getPastEvents('allEvents', {
    //   fromBlock: 696060,
    //   toBlock: 696069,
    // });
    // console.dir(res, { depth: 6 });
    // const res = await web3.eth.getPastLogs({
    //   fromBlock: 684112,
    //   address: idleGameSc.address,
    // });
    // console.dir(res, { depth: 6 });
}
main();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map