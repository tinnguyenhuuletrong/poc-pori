import {
  addWalletConnectToContext,
  init,
} from '@pori-and-friends/pori-actions';
import { AdventureInfoEx, ENV } from '@pori-and-friends/pori-metadata';
import * as Repos from '@pori-and-friends/pori-repositories';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import moment from 'moment';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import * as os from 'os';
import process from 'process';
import {
  cmdDoAtk,
  cmdDoFinish,
  cmdDoMine,
  cmdScheduleOpenMine,
} from './app/cmds';
import { refreshAdventureStatsForAddress } from './app/computed';
import { activeEnv, botMasterUid, env, playerAddress } from './app/config';
import { withErrorWrapper } from './app/utils';
import {
  addWorkerTaskForMineEndNotify,
  registerWorkerNotify,
  registerWorkerStartNewMine,
} from './app/worker';

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
  const { ctx, realm, scheduler } = await boot();

  loadBotMemory();

  console.log('🤖 booting step 2 done');

  const bot = new TelegramBot(token, { polling: true });
  bot.on('polling_error', console.log);

  // worker register
  registerWorkerNotify({ ctx, realm, scheduler, bot });
  registerWorkerStartNewMine({ ctx, realm, scheduler, bot });

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
      _v: 5
    </code>
    Have fun!
    `;
    bot.sendMessage(msg.chat.id, resp, { parse_mode: 'HTML' });
  });

  bot.onText(/\/clear/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    await bot.sendMessage(msg.chat.id, 'clear...', {
      reply_markup: { remove_keyboard: true },
    });
  });

  bot.onText(/\/help/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    await bot.sendMessage(msg.chat.id, 'clear...', {
      reply_markup: {
        keyboard: [
          [{ text: '/stats' }, { text: '/wallet_reset' }],
          [{ text: '/sch_list' }, { text: '/whoami' }],
          [{ text: '/finish' }],
          [{ text: '/sch_mine' }],
        ],
        resize_keyboard: true,
      },
    });
  });

  bot.onText(/\/wallet_reset/, async function (msg) {
    if (!requireBotMaster(msg)) return;
    captureChatId(msg.chat.id);

    await bot.sendMessage(msg.chat.id, 'trying to reset wallet channel...');
    ctx.walletConnectChannel = null;
    await addWalletConnectToContext(
      ctx,
      activeEnv.environment.walletConnectSessionStoragePath
    );
  });

  bot.onText(/\/stats/, async (msg, match) => {
    await withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const addr = playerAddress;
      await bot.sendMessage(msg.chat.id, 'refreshing....');
      const humanView = await refreshAdventureStatsForAddress(
        { realm, ctx },
        addr
      );

      // targets:
      // ${humanView.protentialTarget.map(
      //   (itm) => `\n\t \\- ${itm.mineId} ${itm.hasBigReward} ${itm.sinceSec}`
      // )}

      const protentialTarget = humanView.protentialTarget;
      const mines = Object.values(humanView.mines);
      const adventureRender = (inp: AdventureInfoEx) => {
        const appLink = `https://link.trustwallet.com/open_url?url=${inp.link}&coin_id=966`;
        return `  * <a href="${appLink}">${inp.mineId}</a>
          - supporterAddr: ${inp.supporterAddress}
          - blockTo: ${inp.blockedTo.toLocaleString()}
          - hasBigReward: ${inp.hasBigReward}
          - isFarmer: ${inp.isFarmer}
          - farmerRewardLevel: ${inp.farmerRewardLevel?.join(',')}
          - supporterRewardLevel: ${inp.supporterRewardLevel?.join(',')}
        `;
      };

      const resp = `
<b>Mines:</b>      
${mines.map((itm) => adventureRender(itm)).join('\n')}
<b>Targets:</b>
${protentialTarget
  .map(
    (itm) =>
      `\t\t - ${itm.mineId} bigReward-${itm.hasBigReward} since-${itm.sinceSec} sec`
  )
  .join('\n')}
<b>Summary:</b>
  - <i>canDoNextAction: </i> <b>${humanView.canDoNextAction}</b>
  - <i>activeMine: </i> ${humanView.activeMines}
  - <i>nextActionAt: </i> ${humanView.nextActionAt}
  - <i>gasPriceGWEI: </i> ${humanView.gasPriceGWEI}
      `;

      let keyboardActions: InlineKeyboardButton[] = [];
      const hasPortal = canUsePortal(humanView);

      keyboardActions = protentialTarget.slice(0, 5).map((itm) => {
        return {
          text: `${itm.mineId} - ${itm.hasBigReward ? 1 : 0}`,
          switch_inline_query_current_chat: hasPortal
            ? `/atk ${itm.mineId} 1`
            : `/atk ${itm.mineId} 0`,
        };
      });
      const newMineAction: InlineKeyboardButton = {
        text: `new mine`,
        switch_inline_query_current_chat: hasPortal ? `/mine 1` : `/mine 0`,
      };

      // capture and send end notification
      captureNotificationForMyMine(mines, msg);

      await bot.sendMessage(msg.chat.id, 'finish....');
      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [keyboardActions, [newMineAction]],
        },
      });
    });
  });

  bot.onText(/\/mine (.*)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const args = match[1];
      await cmdDoMine({ ctx, realm, bot, msg, args });
    });
  });

  bot.onText(/\/atk (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const args = match[1];
      await cmdDoAtk({ ctx, realm, bot, msg, args });
    });
  });

  bot.onText(/\/finish (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const args = match[1];
      await cmdDoFinish({ ctx, realm, bot, msg, args });
    });
  });

  bot.onText(/\/sch_mine (.*)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);
      const args = match[1];
      await cmdScheduleOpenMine({ ctx, realm, scheduler, bot, msg, args });
    });
  });

  bot.onText(/\/sch_list/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const allPendingJobs = await scheduler.listPendingJob(realm);
      const resp = allPendingJobs
        .map((itm) => {
          return `  * ${itm._id} - ${
            itm.codeName
          } - ${itm.runAt.toLocaleString()} (${moment(itm.runAt).fromNow()})`;
        })
        .join('\n');

      let keyboardActions: InlineKeyboardButton[] = [];
      keyboardActions = allPendingJobs.map((itm) => {
        return {
          text: `del - ${itm._id}`,
          switch_inline_query_current_chat: `/sch_del ${itm._id}`,
        };
      });

      await bot.sendMessage(msg.chat.id, resp || 'empty', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [keyboardActions],
        },
      });
    });
  });

  bot.onText(/\/sch_del (.+)/, async (msg, match) => {
    withErrorWrapper({ chatId: msg.chat.id, bot }, async () => {
      if (!requireBotMaster(msg)) return;
      captureChatId(msg.chat.id);

      const jobId = match[1];
      await scheduler.deleteJob(realm, jobId);

      bot.sendMessage(msg.chat.id, `jobId ${jobId} deleted`);
    });
  });

  // --------------------
  // cmd handler End
  // --------------------

  console.log('🤖 started');

  for (const id of Memory.activeChats) {
    await bot.sendMessage(id, 'hi 👋!');
  }

  function captureNotificationForMyMine(
    mines: AdventureInfoEx[],
    msg: TelegramBot.Message
  ) {
    for (const itm of mines) {
      // only register for unfinished mine
      if (!itm.canCollect)
        addWorkerTaskForMineEndNotify({
          ctx,
          realm,
          scheduler,
          chatId: msg.chat.id,
          mineId: itm.mineId,
          endAt: itm.blockedTo,
          pnMessage: `mine ${itm.mineId} end`,
        });
    }
  }

  function canUsePortal(humanView: {
    note: any;
    // my active adventures
    mines: Record<string, AdventureInfoEx>;
    // protential target
    targets: any;
    protentialTarget: any[];
    activeMines: number;
    canDoNextAction: boolean;
    nextActionAt: string;
    gasPriceGWEI: string;
  }) {
    return humanView.activeMines <= 0;
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
  const scheduler = new Repos.Services.SchedulerService();
  await scheduler.start(realm);

  return { realm, ctx, scheduler };
}

function requireBotMaster(msg: TelegramBot.Message) {
  return msg.from.id.toString() === botMasterUid;
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

main();
