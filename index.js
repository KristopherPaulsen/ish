#!/usr/bin/env node

const Fuse = require('fuse.js');

const main = (data) => {

  const searchStrings = process.argv.slice(2);
  const list = data.toString().split('\n');

  const fuse = new Fuse(
    list.map(item => ({ item, })),
    {
      keys: ['item'],
      id: 'item',
      sort: true,
      includeScore: true,
      findAllMatches: true,
    },
  );

  const results = searchStrings
    .map(string => fuse.search(string))
    .flat()
    .sort((a,b) => a.score - b.score)
    .map(({ item }) => item);

  if (!results[0]) return;

  console.log(results[0]);
}

process.stdin.on('data', main);
