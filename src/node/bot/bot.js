const { Discord } = require('../discord/discord.js');
const { Logger } = require('../util/logger/logger.js');
const { Environment } = require('../util/env/environment.js');

const logger = new Logger('bot');
const env = new Environment({ DISCORD_BOT_TOKEN: 'string' });

if (env.validKeys) {
  const discordBot = new Discord(env.values.get('DISCORD_BOT_TOKEN'));
}