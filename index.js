#!/usr/bin/env node

const yargs = require('yargs');
const Fuse = require('fuse.js');

const main = (data) => {
  const args = yargs
    .option('json', {
      type: 'boolean',
      coerce: (arg) => typeof(arg) !== 'undefined',
      describe: 'Whether or not to return in json format',
   }).argv;

  const searchStrings = args._;
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

  if(!results[0]) {
    return;
  }
  else if(args.json) {
    console.log(JSON.stringify({ text: results[0] }));
  }
  else {
    console.log(results[0]);
  }
}

const printHelp = () => {
console.log(`

  echo -e 'foo' | ish 'fo'

  Example (Single Match):

    echo -e "Food\\nDrink\\nSnacks" | ish 'fod'
      # Food

  Example (Multi Matching)

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' 'Drink'
      # Food

    echo -e "Food\\nDrink\\nSnacks" | ish 'fdd' 'Dink'
      # Drink

  With JSON output

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' --json
      # { "text": "Food" }

`);
}

// -----------------------------------------------------------------------------
if (process.stdin.isTTY) {
  if(!process.argv[2]) return;

  process.stdin.on('data', main);
}
