#!/usr/bin/env node
const yargs = require('yargs');
const Fuse = require('fuse.js');

const preMain = () => {
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
    .epilogue(help())
    .argv;

  process.stdin.on('data', data => main({ data, args }));
}

const main = ({ data, args }) => {
  const searchStrings = args._;
  const listToSearch = data.toString().split('\n');

  const matches = findMatch({ searchStrings, listToSearch, args });

  if(!matches.length) return;

  if(args.json) {
    console.log(JSON.stringify({ matches, }));
  }
  else if(args.jsonString) {
    console.log(toJsonString({ matches }));
  }
  else {
    matches.forEach(match => console.log(match));
  }
}

const findMatch = ({ searchStrings, listToSearch, args }) => {
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

  const temp = searchStrings
    .map(string => fuse.search(string))
    .flat()
    .sort((a,b) => a.score - b.score)
    .map(({ item }) => item);


  return args.all ? temp : [temp[0]]
}

const toJsonString = (obj) => JSON.stringify(JSON.stringify(obj));

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
`;

// -----------------------------------------------------------------------------

preMain();
