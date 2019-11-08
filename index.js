#!/usr/bin/env node
const yargs = require('yargs');
const Fuse = require('fuse.js');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile); // (A)
const { isUndefined, get, camelCase } = require('lodash');

const main = async () => {
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
    .option('opts', {
      type: 'array',
      describe: 'Custom options for underlying fusejs, passed to initialization',
      coerce: args => toOpts(args),
    })
    .epilogue(help())
    .argv;

  const stdin = await readFileAsync(0, 'utf8');

  const matches = findMatch({
    searchStrings: args._,
    listToSearch: stdin.toString().split('\n'),
    opts: get(args, 'opts', {}),
  });

  if(args.json && args.all) {
    console.log(JSON.stringify({ matches }));
  }
  else if (args.jsonString && args.all) {
    console.log(toEscapedJSON({ matches }));
  }
  else if(args.json) {
    console.log(JSON.stringify({ match: get(matches, 0, '') }));
  }
  else if (args.jsonString) {
    console.log(toEscapedJSON({ match: get(matches, 0, '') }));
  }
  else if(args.all) {
    matches.forEach(match => console.log(match));
  }
  else {
    console.log(get(matches, 0, ''));
  }
}

const findMatch = ({ searchStrings, listToSearch, opts }) => {
  const fuse = new Fuse(
    listToSearch.map(item => ({ item, })),
    {
      ...opts,
      keys: ['item'],
      id: 'item',
      shouldSort: true,
      includeScore: true,
      findAllMatches: true,
    },
  );

  return searchStrings
    .map(string => fuse.search(string))
    .flat()
    .map(({ item }) => item);
}

const toEscapedJSON = (obj) => JSON.stringify(JSON.stringify(obj));

const trueIfDefined = (arg) => !isUndefined(arg);

const toOpts = (arg) => (
  arg.map(item => item.split("\="))
     .reduce((opts, [key, value]) => ({
        ...opts,
        [camelCase(key)]: safeEval(value),
     }), {})
)

const safeEval = (value) => {
  try {
    return eval(value);
  } catch(error) {
    return false;
  }
}

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
      # { "match": "Food" }

    echo "Food" | ish 'food' --json-string
      # "{\\"match\\":\\"Food\\"}"


  Listing all possible matches, left to right, best to worst.

    echo -e "Food\\nFodge\\nFreak" | ish 'fodd' --all --json
      # { "matches": [ "Food", 'Fodge', "Freak" ] }

    echo -e "Foood\\nFodge\\nFreak" | ish 'fodd' --all
      # Food
      # Fodge
      # Freak


  Supported Options

    * caseSensitive
    * distance
    * threshold
    * location
    * maxPatternLength
    * minMatchCharLength

   echo "FOOD" | ish "food" --opts case-sensitive=true
      #

    echo "FOOD" | ish "FOOD" --opts case-sensitive=true
      # FOOD


  For more information on Fusejs options, see:

    https://fusejs.io
`;
// -----------------------------------------------------------------------------

main();
