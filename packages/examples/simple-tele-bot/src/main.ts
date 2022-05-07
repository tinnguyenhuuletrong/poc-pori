import * as os from 'os';
import * as AppEnv from './environments/environment';
import * as AppEnvProd from './environments/environment.prod';
import TelegramBot from 'node-telegram-bot-api';
import process from 'process';
import {
  init,
  close,
  Input,
  DataView,
  Adventure,
  addWalletConnectToContext,
} from '@pori-and-friends/pori-actions';
import {
  AdventureInfo,
  Context,
  ENV,
  getIdleGameAddressSC,
} from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import type { ITxData } from '@walletconnect/types';
import { existsSync, readFileSync, writeFileSync } from 'fs';

interface BotMemoryStructure {
  activeChats: string[];
}

let Memory: BotMemoryStructure;
function captureChatId(chatId) {
  if (!Memory.activeChats.includes(chatId)) {
    Memory.activeChats.push(chatId);
    saveBotMemory();
  }
}

const env = ENV.Prod;
const activeEnv = env === ENV.Prod ? AppEnvProd : AppEnv;
const playerAddress = process.env.PLAYER_ADDRESS;
const botMasterUid = process.env.TELEGRAM_MASTER_ID;
const MINE_ATK_PRICE_FACTOR = 1.2;

async function main() {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) {
    console.error('missing env TELEGRAM_TOKEN');
    return process.exit(1);
  }

  if (!botMasterUid) {
    console.error('missing env TELEGRAM_MASTER_ID');
    return process.exit(1);
  }

  console.log('🤖 booting step 1 done');
  const { ctx, realm } = await boot();

  loadBotMemory();

  console.log('🤖 booting step 2 done');

  const bot = new TelegramBot(token, { polling: true });
  bot.on('polling_error', console.log);

  // --------------------
  // cmds begin
  // --------------------

  bot.onText(/\/whoami/, function whoami(msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    console.log(msg);

    const resp = `i am 🤖. 
    <code>
      isMaster: ${msg.from.id.toString() === botMasterUid}
      masterUid: ${botMasterUid}
      uptime: ${process.uptime()}
      pid: ${process.pid}
      hostname: ${os.hostname()}
      playerAddress: ${playerAddress}
      _v: 4
    </code>
    Have fun!
    `;
    bot.sendMessage(msg.chat.id, resp, { parse_mode: 'HTML' });
  });

  bot.onText(/\/stats/, async (msg, match) => {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    const addr = playerAddress;
    await bot.sendMessage(msg.chat.id, 'refreshing....');
    const humanView = await refreshAdventureStatsForAddress(
      { realm, ctx },
      addr
    );

    const resp = '```json' + JSON.stringify(humanView, null, 2) + '```';

    await bot.sendMessage(msg.chat.id, 'finish....');
    await bot.sendMessage(msg.chat.id, resp, { parse_mode: 'MarkdownV2' });
  });

  bot.onText(/\/mine (.*)/, async (msg, match) => {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    const args = match[1];

    if (!ctx.walletConnectChannel?.connected) {
      console.warn('wallet channel not ready. Please run .wallet.start first');
      return;
    }

    const tmp = args.split(' ');
    const usePortal = boolFromString(tmp[0]);

    const poriants = ['1346', '5420', '1876'];
    const index = Adventure.randAdventureSlot(3);

    await bot.sendMessage(
      msg.chat.id,
      `roger that!. Start new mine. usePortal:${usePortal}`
    );

    const callData = ctx.contract.methods
      .startAdventure(
        // poriants
        poriants,

        // index
        index,

        // notPortal
        !usePortal
      )
      .encodeABI();

    console.log({
      poriants,
      index,
      usePortal,
    });

    const tx = {
      from: ctx.walletConnectChannel.accounts[0],
      to: getIdleGameAddressSC(env).address,
      data: callData, // Required
    };

    await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

    // Sign transaction
    const txHash = await sendRequestForWalletConnectTx({ ctx }, tx);
    await bot.sendMessage(msg.chat.id, `https://polygonscan.com/tx/${txHash}`);
  });

  bot.onText(/\/atk (.+)/, async (msg, match) => {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    const args = match[1];

    if (!ctx.walletConnectChannel?.connected) {
      console.warn('wallet channel not ready. Please run .wallet.start first');
      return;
    }
    const tmp = args.split(' ');
    const mineId = tmp[0];
    const usePortal = !!tmp[1];
    if (!mineId) {
      await bot.sendMessage(
        msg.chat.id,
        '\tUsage: /atk <mineId> [usePortal = false]'
      );
      return;
    }

    const addvStats = await refreshAdventureStatsForAddress(
      { realm, ctx },
      playerAddress
    );

    await bot.sendMessage(
      msg.chat.id,
      `roger that!. Start atk mineId:${mineId} usePortal:${usePortal}`
    );
    console.log({ mineId, usePortal });
    const mineInfo = addvStats.targets[mineId];

    if (!mineInfo) {
      console.log('opps. Mine status changed');
      await bot.sendMessage(
        msg.chat.id,
        `opps. Mine status changed. Retreat....`
      );
      return;
    }

    const poriants = ['1346', '5420', '1876'];
    const index = Adventure.randAdventureSlot(3, mineInfo.farmerSlots);

    const callData = ctx.contract.methods
      .support1(
        // mineId
        mineId,
        // poriants
        poriants,

        // index
        index,

        // notPortal
        !usePortal
      )
      .encodeABI();

    console.log({
      method: 'support1',
      mineId,
      poriants,
      index,
      usePortal,
      callData,
    });

    const web3GasPrice = await ctx.web3.eth.getGasPrice();
    const factor = MINE_ATK_PRICE_FACTOR;

    const tx: ITxData = {
      from: ctx.walletConnectChannel.accounts[0],
      to: getIdleGameAddressSC(env).address,
      data: callData, // Required
      gasPrice: +web3GasPrice * factor,
    };

    await bot.sendMessage(msg.chat.id, `Sir! please accept tx in trust wallet`);

    // Sign transaction
    const txHash = await sendRequestForWalletConnectTx({ ctx }, tx);
    await bot.sendMessage(msg.chat.id, `https://polygonscan.com/tx/${txHash}`);
  });

  // --------------------
  // cmd handler End
  // --------------------

  console.log('🤖 started');

  for (const id of Memory.activeChats) {
    await bot.sendMessage(id, 'hi 👋!');
  }

  // --------
  // Cleanup
  async function close() {
    console.log('cleanup start');
    for (const id of Memory.activeChats) {
      await bot.sendMessage(id, 'bye 👋!');
    }

    console.log('bye 👋!');
  }
  process.once('SIGTERM', async () => {
    await close();
    process.exit(0);
  });
}

async function boot() {
  console.log(env, activeEnv);

  if (!playerAddress) {
    console.log('missing process.env.PLAYER_ADDRESS');
    process.exit(1);
  }
  console.log('PlayerAddress:', playerAddress);
  console.log('Example: cli');

  const ctx = await init(ENV.Prod);
  console.log('connected');

  await addWalletConnectToContext(
    ctx,
    activeEnv.environment.walletConnectSessionStoragePath
  );

  const realm = await Repos.openRepo({
    path: activeEnv.environment.dbPath,
  });

  return { realm, ctx };
}

function requireBotMaster(msg: TelegramBot.Message) {
  return msg.from.id.toString() === botMasterUid;
}

function boolFromString(inp) {
  if (inp === '1' || inp === 'true') return true;
  return false;
}

function loadBotMemory() {
  if (
    activeEnv.environment.botMemoryPath &&
    existsSync(activeEnv.environment.botMemoryPath)
  ) {
    const data = readFileSync(activeEnv.environment.botMemoryPath).toString();
    Memory = JSON.parse(data);
    console.log(`🤖 - memory restore from activeEnv.environment.botMemoryPath`);
    return;
  }

  // Init default
  Memory = {
    activeChats: [],
  };
}

function saveBotMemory() {
  if (activeEnv.environment.botMemoryPath) {
    writeFileSync(activeEnv.environment.botMemoryPath, JSON.stringify(Memory));
    console.log(
      `🤖 - memory restore from ${activeEnv.environment.botMemoryPath}`
    );
  }
}

async function refreshAdventureStatsForAddress(
  { realm, ctx }: { realm: Realm; ctx: Context },
  addr: string
) {
  await Input.updateEventDb(realm, ctx, {
    createdBlock: activeEnv.environment.createdBlock,
  });

  const activeAddr = addr || playerAddress;

  const viewData = await DataView.computePlayerAdventure({
    realm,
    playerAddress: activeAddr,
    realmEventStore: await Repos.IdleGameSCEventRepo.findAll(realm),
  });

  // humanView
  const humanView = {
    note: DataView.humanrizeNote(viewData),

    // my active adventures
    mines: {},

    // protential target
    targets: {},
    protentialTarget: [],
    activeMines: 0,
    gasPriceGWEI: '',
  };
  for (const k of Object.keys(viewData.activeAdventures)) {
    const value = viewData.activeAdventures[k] as AdventureInfo;
    if (
      value.farmerAddress === activeAddr ||
      value.supporterAddress === activeAddr
    )
      humanView.mines[k] = DataView.humanrizeAdventureInfo(value);
    else if (value.state === 'AdventureStarted') {
      humanView.targets[k] = DataView.humanrizeAdventureInfo(value);
    }
  }

  humanView.protentialTarget = Object.keys(humanView.targets)
    .map((key) => {
      const val = humanView.targets[key];
      const sinceSec = (Date.now() - new Date(val.startTime).valueOf()) / 1000;
      return {
        mineId: val.mineId,
        hasBigReward: val.hasBigReward,
        startTimeLocalTime: new Date(val.startTime).toLocaleString(),
        startTime: new Date(val.startTime),
        sinceSec,
      };
    })
    .sort((a, b) => {
      return a.hasBigReward - b.hasBigReward;
    });

  humanView.activeMines = Object.keys(humanView.mines).length;

  // mine completed by farmer. But our poriant still lock
  if (humanView.note.readyToStart === false) humanView.activeMines++;

  const web3GasPrice = await currentGasPrice({ ctx });
  humanView.gasPriceGWEI = ctx.web3.utils.fromWei(web3GasPrice, 'gwei');

  return humanView;
}

function sendRequestForWalletConnectTx({ ctx }: { ctx: Context }, tx: ITxData) {
  return ctx.walletConnectChannel
    .sendTransaction(tx)
    .then((result) => {
      console.log(result);
      return ctx.web3.eth.getTransactionReceipt(result);
    })
    .then((txInfo) => {
      console.log(txInfo);
      return txInfo;
    })
    .catch((error) => {
      // Error returned when rejected
      console.error(error);
    });
}

async function currentGasPrice({ ctx }: { ctx: Context }) {
  return await ctx.web3.eth.getGasPrice();
}

main();

process.on('uncaughtException', (err) => {
  console.log('got uncaughtException exit');
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log('got unhandledRejection exit');
  console.error(err);
  process.exit(1);
});
