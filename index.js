#!/usr/bin/env node
const yargs = require('yargs');
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile); // (A)
const { isUndefined, get, camelCase } = require('lodash');

const main = async () => {
  if(!process.argv[2]) return;

  const rawArgs = yargs
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
    .option('line', {
      alias: 'l',
      type: 'boolean',
      describe: 'whether to process per line',
      coerce: trueIfDefined,
    })
    .option('files', {
      alias: 'files',
      type: 'boolean',
      describe: 'whether to process per files',
      coerce: trueIfDefined,
    })
    .option('i', {
      alias: 'in-from-files',
      type: 'string',
    })
    .epilogue(help())
    .argv;

  const args = adjustSettings(rawArgs);

  const stdin = await readFileAsync(0, 'utf8');

  const matches = await ( async () => {
    if(args.files) return getMatchesPerFile(args, stdin);
    if(args.line) return getLineMatches(args, stdin);

    return getMatches(args, stdin);
  })();

  if (args.json && args.all) {
    printJSON({ matches });
  }
  else if (args.jsonString && args.all) {
    printEscapedJson({ matches });
  }
  else if(args.json) {
    printJSON({ match: get(matches, 0, '') });
  }
  else if (args.jsonString) {
    printEscapedJson({ match: get(matches, 0, '') });
  }
  else if(args.all) {
    matches.forEach(match => console.log(match));
  }
  else {
    console.log(get(matches, 0, ''));
  }
}

const getMatchesPerFile = async (args, stdin) => {
  const files = stdin
    .trim()
    .split("\n")
    .filter(path => !path.match(/^\.$|^\.\/$/));

  const contents = await Promise.all(files.map(file =>
    readFileAsync(path.resolve(file), 'utf8'))
  );


  const fuse = new Fuse(
    contents.map((contents, idx) => ({ contents, idx, file: files[idx] })),
    {
      keys: ['contents'],
      tokenize: true,
      includeScore: true,
      findAllMatches: true,
    },
  );

  let matches = args._.map(string => fuse.search(string)).flat();
  matches = matches.sort((a,b) => a.score < b.score);
  console.log(JSON.stringify(matches, null, 2));
}

const getMatches = (args, stdin) => (
  findMatch({
    searchStrings: args._,
    listToSearch: stdin.toString().split('\n'),
    opts: get(args, 'opts', {}),
  })
)

const getLineMatches = (args, stdin) => (
  stdin.trim().split("\n").map(line => {
      return findMatch({
        searchStrings: args._,
        listToSearch: line.split(' '),
        opts: get(args, 'opts', {})
    })[0]
  }).filter(match => match)
);

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

const adjustSettings = (args) => {
  return {
    ...args,
    ...(args.line && { all: true }),
    ...(args.files && { all: true }),
  }
}

const printEscapedJson = (obj) => console.log(JSON.stringify(JSON.stringify(obj)));
const printJSON = (obj) => console.log(JSON.stringify(obj));

const trueIfDefined = (arg) => !isUndefined(arg);

const toOpts = (arg) => (
  arg.map(item => item.split('='))
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

  Line matching mode

    You can also match each line, individually, from a stream of lines.
    Each line is matched individually against the possible matches, left to right, best to worse.

      echo -e "cat cat kat\\nkat kat kat\\ndog dog alligator | ish --line 'dog' 'cat'

      #cat
      #kat
      #dog


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
