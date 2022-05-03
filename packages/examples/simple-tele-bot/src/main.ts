import * as os from 'os';
import TelegramBot from 'node-telegram-bot-api';
import process from 'process';

const Memory = {
  activeChats: [],
};

function captureChatId(chatId) {
  if (!Memory.activeChats.includes(chatId)) Memory.activeChats.push(chatId);
}

async function main() {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) {
    console.error('missing env TELEGRAM_TOKEN');
    return process.exit(1);
  }
  const bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/whoami/, function onEchoText(msg) {
    captureChatId(msg.chat.id);

    const resp = `i am 🤖. 
    <code>
      uptime: ${process.uptime()}
      pid: ${process.pid}
      hostname: ${os.hostname()}
      _v: 3
    </code>
    Have fun!
    `;
    bot.sendMessage(msg.chat.id, resp, { parse_mode: 'HTML' });
  });

  // Matches /love
  bot.onText(/\/love/, function onLoveText(msg) {
    captureChatId(msg.chat.id);

    const opts = {
      reply_to_message_id: msg.message_id,
      reply_markup: {
        keyboard: [
          [{ text: '/echo Yes, you are the bot of my life ❤' }],
          [{ text: '/echo No, sorry there is another one...' }],
        ],
      },
    };
    bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
  });

  // Matches /echo [whatever]
  bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
    captureChatId(msg.chat.id);

    // console.log(msg);
    const resp = match[1];
    bot.sendMessage(msg.chat.id, resp);
  });

  // Matches /editable
  bot.onText(/\/editable/, function onEditableText(msg) {
    captureChatId(msg.chat.id);

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Edit Text',
              // we shall check for this value when we listen
              // for "callback_query"
              callback_data: 'edit',
            },
            {
              text: 'Keep Text',
              // we shall check for this value when we listen
              // for "callback_query"
              callback_data: 'keep',
            },
          ],
        ],
      },
    };
    bot.sendMessage(msg.from.id, 'Original Text', opts);
  });

  // Handle callback queries
  bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    console.log('on callbackQuery', callbackQuery);
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };

    if (action === 'edit') {
      const text = 'Edited Text';
      bot.editMessageText(text, opts);
    } else {
      bot.editMessageText(msg.text, opts);
    }

    await bot.answerCallbackQuery(callbackQuery.id, {
      callback_query_id: callbackQuery.id,
      text: 'roger!',
    });
  });

  console.log('🤖 started');

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
main();
