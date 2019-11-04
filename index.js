#!/usr/bin/env node

const yargs = require('yargs');
const Fuse = require('fuse.js');

const main = () => {
  if(!process.argv[2]) return;

  const args = yargs
    .usage('\necho "Food" | ish "fodd"\n')
    .option('json-string', {
      type: 'string',
    })
    .option('json', {
      type: 'boolean',
      coerce: (arg) => typeof(arg) !== 'undefined',
      describe: 'Whether or not to return in json format',
    })
    .epilogue(help())
    .argv;

  process.stdin.on('data', (data) => program({ data, args }));
}

const program = ({ data, args }) => {
  const searchStrings = args._;
  const listToSearch = data.toString().split('\n');

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
  else if(args.jsonString) {
    console.log(toJsonString({ text: results[0] }));
  }
  else {
    console.log(results[0]);
  }
}

const toJsonString = (obj) => JSON.stringify(JSON.stringify(obj));

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

    # Or, for a raw json string

    echo "Food" | ish 'food' --json-string
      # "{\\"text\\":\\"Food\\"}"
`;

// -----------------------------------------------------------------------------

main();
