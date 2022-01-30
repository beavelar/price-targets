const { Client, Intents, Message, Channel } = require('discord.js');
const { Logger } = require('../util/logger/logger.js');

/**
 * Basic wrapper of the Discord bot client implementation
 */
class Discord {
  /** The Discord bot client */
  _client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL']
  });

  /** The message to display whenever a help command is received */
  _helpMessage =
    '\`\`\`\n' +
    '------------------------------------------------------------\n' +
    'Help Menu\n' +
    '------------------------------------------------------------\n' +
    'No available commands at the moment, sorry!\n' +
    '\`\`\`'

  /** Logger for Discord */
  _logger = new Logger('discord');

  /**
   * @param {string} token The string token to utilize to login the Discord bot
   */
  constructor(token) {
    if (token) {
      // Setup handlers
      this._client.on('ready', this._onReady.bind(this));
      this._client.on('messageCreate', this._messageCreate.bind(this));

      // Login discord bot utilizing the bot token
      this._logger.debug('Discord', 'logging in as Discord bot utilizing token');
      this._client.login(token);
    }
    else {
      this._logger.critical('Discord', 'no toekn provided, Discord bot will not be started');
    }
  }

  /**
   * Client ready handler. We will just log that the bot is up and running when this event
   * is caught
   */
  _onReady() {
    this._logger.info('onReady', `discord bot is up an running as ${this._client.user.tag}`);
  }

  /**
   * Client messageCreate handler. We will handle the message here.
   * 
   * @param {Message} message The message caught by the messageCreate event
   */
  _messageCreate(message) {
    if (message.author.bot) return;
    this._logger.debug('messageCreate', 'received messageCreate event');

    if (message.content.startsWith('!pt')) {
      this._logger.debug('messageCreate', 'received !pt trigger');
      const command = message.content.replace('!pt', '').trim();
      if (command.includes('help')) {
        this._logger.info('messageCreate', 'received help command');
        this._sendMessage(message.channel, this._helpMessage);
      }
      else {
        this._logger.warning('messageCreate', `unknown command received: ${command}`);
      }
    }
  }

  /**
   * Helper function to send a desired message to a desired channel
   * 
   * @param {Channel} channel The discord channel to send the message to
   * @param {string} message The desired message to send
   */
  _sendMessage(channel, message) {
    channel.send(message).then((response) => {
      this._logger.info('sendMessage', `successfully sent message to ${response.guild.id}`);
    }).catch((error) => {
      this._logger.critical('sendMessage', 'error occurred attempting to send message', error);
    });
  }
}

module.exports.Discord = Discord;