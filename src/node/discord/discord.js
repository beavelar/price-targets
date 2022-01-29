const { Client, Intents } = require('discord.js');
const { Logger } = require('../util/logger/logger.js');

class Discord {
  _logger = new Logger('discord');

  client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL']
  });

  constructor(token) {
    // Setup handlers
    this.client.on('ready', this._onReady.bind(this));
    this.client.on('messageCreate', this._messageCreate.bind(this));

    // Login discord bot utilizing the bot token
    this.client.login(token);
  }

  /**
   * Client ready handler. We will just log that the bot is up and running when this event
   * is caught
   */
  _onReady() {
    this._logger.info('onReady', `discord bot is up an running as ${this.client.user.tag}`);
  }

  /**
   * Client messageCreate handler. We will handle the message here.
   * 
   * @param {Message} message The message caught by the messageCreate event
   * @returns 
   */
  _messageCreate(message) {
    if (message.author.bot) return;
    this._logger.debug('onMessageCreate', 'received message event');

    if (message.content.startsWith('!hello')) {
      message.channel.send('Hello World :)').then((message) => {
        this._logger.debug('onMessage', `successfully sent message to ${message.guild.id}`);
      }).catch((error) => {
        this._logger.critical('onMessage', 'error occurred attempting to reply to command', error);
      });
    }
  }
}

module.exports.Discord = Discord;