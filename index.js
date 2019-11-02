#!/usr/bin/env node

const Fuse = require('fuse.js');

const main = (data) => {
  const string = process.argv.slice(2)[0];

  const list = data.toString().split('\n');

  const fuse = new Fuse(
    list.map(item => ({ item })),
    { keys: ['item'] },
  );

  console.log(fuse.search(string)[0].item);
}

process.stdin.on('data', main);
