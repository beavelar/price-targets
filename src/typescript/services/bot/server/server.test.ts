import { Discord } from '../../../util/discord/discord';
import { BotServer } from './server';

describe('BotServer test suite', () => {
  test('place holder test', () => {
    const discord = new Discord('', '');
    const server = new BotServer(discord);
    expect(server).toBeDefined();
  });
});