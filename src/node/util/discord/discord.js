const {
  Channel,
  Client,
  Intents,
  Message,
  MessageEmbed
} = require('discord.js');
const { Logger } = require('../logger/logger.js');

/**
 * Basic wrapper of the Discord bot client implementation
 */
class Discord {
  /** The Discord bot client */
  _client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL']
  });

  /** The description of the help message to display whenever a help command is received */
  _helpDescriptionMessage = 'Price Targets bot can be utilized to view price target ' +
    'updates and current price targets provided by various analysts. Price target ' +
    'updates will get displayed at 7AM MST Monday - Friday';

  /** The message to display whenever a help command is received */
  _helpMessage = new MessageEmbed({
    title: 'Help Menu',
    color: '#00D100',
    description: this._helpDescriptionMessage,
    fields: [{
      name: 'Commands',
      value: '`pt!rating`, `pt!help`'
    }, {
      name: '__pt!rating__',
      value: 'Request the current lowest, highest, and average price targets provided by various analysts'
    }, {
      name: '__pt!help__',
      value: 'Display the help menu to view all available commands'
    }]
  });

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

    if (message.content.startsWith('pt!')) {
      this._logger.debug('messageCreate', 'received pt! trigger');
      const command = message.content.replace('pt!', '').trim();
      if (command.startsWith('help')) {
        this._logger.info('messageCreate', 'received help command');
        this._sendMessage(message.channel, this._helpMessage);
      }
      else if (command.startsWith('rating')) {
        this._logger.info('messageCreate', 'received rating command');
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
   * @param {string | MessageEmbed} message The desired message to send
   */
  _sendMessage(channel, message) {
    const msg = typeof message === 'string' ? message : { embeds: [message] };
    channel.send(msg).then((response) => {
      this._logger.info('sendMessage', `successfully sent message to ${response.guild.id}`);
    }).catch((error) => {
      this._logger.critical('sendMessage', 'error occurred attempting to send message', error);
    });
  }
}

module.exports.Discord = Discord;