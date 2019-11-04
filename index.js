#!/usr/bin/env node
const yargs = require('yargs');
const Fuse = require('fuse.js');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile); // (A)

const preMain = async () => {
  if(!process.argv[2]) return;

  const args = yargs
    .usage('\necho "Food" | ish "fodd"\n')
    .option('json-string', {
      alias: 'jsonString',
      type: 'string',
      describe: 'Whether or not to return in string-json format',
      coerce: trueIfDefined,
    })
    .option('json', {
      type: 'boolean',
      describe: 'Whether or not to return in json format',
      coerce: trueIfDefined,
    })
    .option('json-string', {
      type: 'boolean',
      describe: 'Whether or not to return in json string format',
      coerce: trueIfDefined,
    })
    .option('all', {
      type: 'boolean',
      describe: 'Whether or not to return ALL matches, ranked best to worst, left to right',
      coerce: trueIfDefined,
    })
    .epilogue(help())
    .argv;

  const stdin = await readFileAsync(0, 'utf8');

  main({ args, stdin });
}

const main = ({ stdin, args }) => {
  const searchStrings = args._;
  const listToSearch = stdin.toString().split('\n');

  const matches = findMatch(searchStrings, listToSearch);

  printFormat(matches, args);
}

const printFormat = (matches, args) => {
  if(args.json && args.all) {
    console.log(JSON.stringify({ matches }));
  }
  else if (args.jsonString && args.all) {
    console.log(toEscapedJSON({ matches }));
  }
  else if(args.json) {
    console.log(JSON.stringify({ match: matches[0] || '' }));
  }
  else if (args.jsonString) {
    console.log(toEscapedJSON({ match: matches[0] || '' }));
  }
  else if(args.all) {
    matches.forEach(match => console.log(match));
  }
  else {
    console.log(matches[0] || '');
  }
}

const findMatch = (searchStrings, listToSearch) => {
  const fuse = new Fuse(
    listToSearch.map(item => ({ item, })),
    {
      keys: ['item'],
      id: 'item',
      sort: true,
      includeScore: true,
      findAllMatches: true,
    },
  );

  return searchStrings
    .map(string => fuse.search(string))
    .flat()
    .sort((a,b) => a.score - b.score)
    .map(({ item }) => item);
}

const toEscapedJSON = (obj) => JSON.stringify(JSON.stringify(obj));

const trueIfDefined = (arg) => typeof(arg) !== 'undefined';

//polyfill from stackoverflow
Object.defineProperty(Array.prototype, 'flat', {
  value: function(depth = 1) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
    }, []);
  }
});

const help = () => `
  Example (Single Match):

    echo -e "Food\\nDrink\\nSnacks" | ish 'fod'
      # Food


  Example (Multi Matching)

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' 'Drink'
      # Food

    echo -e "Food\\nDrink\\nSnacks" | ish 'fdd' 'Dink'
      # Drink


  Example (JSON output) Usefull for chaining with jq, fx, etc

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' --json
      # { "text": "Food" }

    echo "Food" | ish 'food' --json-string
      # "{\\"text\\":\\"Food\\"}"


  Listing all possible matches, left to right, best to worst.

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' --all --json
      # { "matches": [ 'Food', 'Fodge', 'Freak' ] }

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' --all
      # Food
      # Fodge
      # Freak
`;
// -----------------------------------------------------------------------------

preMain();
