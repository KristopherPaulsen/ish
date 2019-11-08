const fs = require('fs');
const path = require('path');
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

      expect(result).toMatch("{\"match\":\"Food\"}");
    });

    it('returns json output for multi match', () => {
      const ish = spawnSync('./index.js', ['Food', 'food', '--json'], {
        input: 'Food\nfod',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("{\"match\":\"Food\"}");
    });

    it('returns json output when combined with --all, but only close matches', () => {
      const ish = spawnSync('./index.js', ['fod', '--json', '--all'], {
        input: 'Food\nmisc',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("{\"matches\":[\"Food\"]}");
    });

    it('returns json output when combined with --all, but only for multiple close matches', () => {
      const ish = spawnSync('./index.js', ['food', '--json', '--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("{\"matches\":[\"Food\",\"Fodd\"]}");
    });
  })

  describe('json-string output', () => {
    it('returns escaped json string for single match', () => {
      const ish = spawnSync('./index.js', ['food', '--json-string'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("\"{\\\"match\\\":\\\"Food\\\"}\"");
    });

    it('returns escaped json string for multi match', () => {
      const ish = spawnSync('./index.js', ['food', '--json-string', '--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("\"{\\\"matches\\\":[\\\"Food\\\",\\\"Fodd\\\"]}\"");
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

  describe('weird inputs: no stdin', () => {
    it('returns nothing when given nothing', () => {
      const ish = spawnSync('./index.js');

      const result = ish.stdout.toString();

      expect(result).toMatch('');
    });

    it('returns nothing when given matches, but no stdin', () => {
      const ish = spawnSync('./index.js', ['food']);

      const result = ish.stdout.toString();

      expect(result).toMatch('');
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

      expect(result).toMatch("{\"match\":\"\"}");
    });

    it('returns empty json when given nothing, and using --json --all', () => {
      const ish = spawnSync('./index.js', ['--json', '--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch("{\"matches\":[]}");
    });

    it('returns nothing when given nothing, and using --all', () => {
      const ish = spawnSync('./index.js', ['--all'], {
        input: 'Food\nFodd',
      });

      const result = ish.stdout.toString();

      expect(result).toMatch('');
    });
  });
});
