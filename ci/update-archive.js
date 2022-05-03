#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.join(__dirname, '../');

execSync(
  `zip -j ./archived/allEvents.prod.realm.zip ./archived/repo/prod/allEvents.prod.realm`,
  {
    cwd,
    stdio: 'inherit',
  }
);

execSync(`zipinfo archived/allEvents.prod.realm.zip`, {
  cwd,
  stdio: 'inherit',
});
