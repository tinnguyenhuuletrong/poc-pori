#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.join(__dirname, '../');

const gitHash = execSync('git rev-parse --short HEAD', { cwd }).toString();
const imgTag = `pori:${gitHash}`;
execSync('yarn run nx build examples-cli --prod', {
  cwd,
  stdio: 'inherit',
});

execSync(
  'DEBUG=pori:* node dist/packages/examples/cli/main.js --cmd ci.uploadSnapshot',
  {
    cwd,
    stdio: 'inherit',
  }
);
