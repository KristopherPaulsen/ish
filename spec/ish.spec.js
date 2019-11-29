const { spawnSync } = require('child_process');

describe('ish', () => {

  describe('multi matching', () => {
    it('fuzzy matches with one "search string"', () => {
      const ish = spawnSync('./index.js', ['fodd'], {
        input: 'Food',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('Food');
    });

    it('fuzzy matches with two "search string"', () => {
      const ish = spawnSync('./index.js', ['fodd', 'drink'], {
        input: 'Food',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('Food');
    });

    it('fuzzy matches with three "search string"', () => {
      const ish = spawnSync('./index.js', ['fodd', 'drink', 'snacks'], {
        input: 'Food',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('Food');
    });

    it('falls back to closer matches', () => {
      const ish = spawnSync('./index.js', ['drnk', 'fod', 'snacks'], {
        input: 'Food',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('Food');
    });
  })

  describe('json output', () => {
    it('returns json output for single match', () => {
      const ish = spawnSync('./index.js', ['fod', '--json'], {
        input: 'Food',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual('\"Food\"');
    });

    it('returns json output for multi match', () => {
      const ish = spawnSync('./index.js', ['Food', 'food', '--json'], {
        input: 'Food\nfod',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual('\"Food\"');
    });

    it('returns json output when combined with --all, but only close matches', () => {
      const ish = spawnSync('./index.js', ['fod', '--json', '--all'], {
        input: 'Food\nmisc',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual(['Food']);
    });

    it('returns json output when combined with --all, but only for multiple close matches', () => {
      const ish = spawnSync('./index.js', ['food', '--json', '--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual(['Food', 'Fodd']);
    });
  })

  describe('json-string output', () => {
    it('returns escaped json string for single match', () => {
      const ish = spawnSync('./index.js', ['food', '--json-string'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual('\"Food\"');
    });

    it('returns escaped json string for multi match', () => {
      const ish = spawnSync('./index.js', ['food', '--json-string', '--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("\"[\\\"Food\\\",\\\"Fodd\\\"]\"");
    });
  })

  describe('passing options', () => {
    it('does not match when --case-sensitive is true, and completely wrong case is used', () => {
      const ish = spawnSync('./index.js', ['food', '--opts', 'case-sensitive=true'], {
        input: 'FOOD',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('');
    });

    it('does match when --case-sensitive is true, and completely correct case is used', () => {
      const ish = spawnSync('./index.js', ['FOOD', '--opts', 'case-sensitive=true'], {
        input: 'FOOD',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('FOOD');
    });

    it('keeps default options, even if the user tries to be naughty', () => {
      const ish = spawnSync(
        './index.js',
        ['exampleString', '--opts', 'id=BAD_ID', 'keys=nowTheyAreGone', 'sort=noSortForYou'],
        { input: 'exampleString', }
      );

      const result = ish.stdout.toString();

      expect(result).toMatch('exampleString');
    });
  })

  describe('line mode', () => {
    it('returns list of matches per line', () => {
      const ish = spawnSync('./index.js', ['--line', 'dog', 'cat'], {
        input: 'cat cat kat\nkat kat kat\ndog dog alligator',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('cat\nkat\ndog');
    });

    it('returns list of matches per line with --json, plural matches', () => {
      const ish = spawnSync('./index.js', ['--line', '--json', 'dog', 'cat'], {
        input: 'cat cat kat\nkat kat kat\ndog dog alligator',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual(["cat","kat","dog"]);
    });
  });

  describe('weird inputs: no search strings', () => {
    it('returns nothing when matched against nothing', () => {
      const ish = spawnSync('./index.js', [], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('');
    });

    it('returns empty json when given nothing, and using --json', () => {
      const ish = spawnSync('./index.js', ['--json'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("");
    });

    it('returns empty json when given nothing, and using --json --all', () => {
      const ish = spawnSync('./index.js', ['--json', '--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(JSON.parse(result)).toEqual([]);
    });

    it('returns nothing when given nothing, and using --all', () => {
      const ish = spawnSync('./index.js', ['--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('');
    });

    it('matches numbers, without weird coercions', () => {
      const ish = spawnSync('./index.js', ['11'], {
        input: '11',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('11');
    });
  });
});
