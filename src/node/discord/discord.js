const { Client, Intents } = require('discord.js');
const { Logger } = require('../util/logger/logger.js');
const { Environment } = require('../util/env/environment.js');

const logger = new Logger('discord');
const env = new Environment({ DISCORD_BOT_TOKEN: 'string' });
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL']
});

client.on('ready', () => {
  logger.info('onReady', `discord bot is up an running as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  logger.debug('onMessageCreate', 'received message event');

  if (message.content.startsWith('!hello')) {
    message.channel.send('Hello World :)').then((message) => {
      logger.debug('onMessage', `successfully sent message to ${message.guild.id}`);
    }).catch((error) => {
      logger.critical('onMessage', 'error occurred attempting to reply to command', error);
    });
  }
});

client.login(env.values.get('DISCORD_BOT_TOKEN'));