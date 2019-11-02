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

  const results = searchStrings.map(string => fuse.search(string)[0])
                               .filter(result => result !== undefined)
                               .map(({ item }) => item);

  console.log(results.join('\n'));
}

process.stdin.on('data', main);
