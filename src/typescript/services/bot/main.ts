import { BotServer } from './server/server';
import { Discord } from '../../util/discord/discord';
import { Environment } from '../../util/env/environment';
import { Logger } from "../../util/logger/logger";

const logger = new Logger('bot');
const env = new Environment({
  BOT_SERVER_PORT: 'int',
  DISCORD_BOT_TOKEN: 'string',
  REALTIME_SERVICE_URI: 'string'
});

if (env.validKeys) {
  const discordBot = new Discord(env.get('DISCORD_BOT_TOKEN') as string, env.get('REALTIME_SERVICE_URI') as string);
  const server = new BotServer(discordBot);
  server.init(env.get('BOT_SERVER_PORT') as string);
}
else {
  logger.critical('init', 'unable to start up Discord bot');
}