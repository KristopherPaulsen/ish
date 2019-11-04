const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');


describe('ish', () => {
  it('fuzzy matches with one "search string"', () => {
    const ish = spawnSync('ish', ['fodd'], {
      input: 'Food',
    });

    const result = ish.stdout.toString();

    expect(result).toMatch('Food');
  });


  it('fuzzy matches with two "search string"', () => {
    const ish = spawnSync('ish', ['fodd', 'drink'], {
      input: 'Food',
    });

    const result = ish.stdout.toString();

    expect(result).toMatch('Food');
  });

  it('fuzzy matches with three "search string"', () => {
    const ish = spawnSync('ish', ['fodd', 'drink', 'snacks'], {
      input: 'Food',
    });

    const result = ish.stdout.toString();

    expect(result).toMatch('Food');
  });

  it('falls back to closer matches', () => {
    const ish = spawnSync('ish', ['drnk', 'fod', 'snacks'], {
      input: 'Food',
    });

    const result = ish.stdout.toString();

    expect(result).toMatch('Food');
  });
});
