#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.join(__dirname, '../');

const gitHash = execSync('git rev-parse --short HEAD', { cwd }).toString();
const imgTag = `pori:${gitHash}`;
execSync('yarn run nx build examples-simple-tele-bot --prod', {
  cwd,
  stdio: 'inherit',
});
// execSync(`docker build . --file telebot.dockerfile -t ${imgTag}`, {
//   cwd,
//   stdio: 'inherit',
// });

// console.log('image:', imgTag);
// console.log(`To Deploy. Run
// heroku container:push ${imgTag}
// heroku container:release ${imgTag}
// `);

execSync(`heroku container:push worker -a pori-bot`, {
  cwd,
  stdio: 'inherit',
});

console.log(`To Deploy. Run 
  heroku container:release worker -a pori-bot
`);
