const { Discord } = require('./discord.js');

describe('Discord test suite', () => {
  process.env.LOG_LEVEL = 'TESTING';

  test('test', () => {
    expect(true).toEqual(true);
  });
});