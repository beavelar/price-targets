const { Discord } = require('../../util/discord/discord.js');
const { Environment } = require('../../util/env/environment.js');
const { Logger } = require('../../util/logger/logger.js');

const logger = new Logger('bot');
const env = new Environment({
  DISCORD_BOT_TOKEN: 'string',
  REALTIME_SERVICE_URI: 'string'
});

if (env.validKeys) {
  const discordBot = new Discord(env.get('DISCORD_BOT_TOKEN'), env.get('REALTIME_SERVICE_URI'));
}
else {
  logger.critical('init', 'unable to start up Discord bot');
}