const {
  Client,
  Guild,
  GuildTextBasedChannel,
  Intents,
  Message,
  MessageEmbed,
  TextBasedChannel
} = require('discord.js');
const { Logger } = require('../logger/logger.js');

/**
 * Basic wrapper of the Discord bot client implementation
 */
class Discord {
  /** The channel the bot will create and send messages too */
  _botChannel = 'price-targets';

  /** The Discord bot client */
  _client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL']
  });

  /** The description of the help/welcome message */
  _descriptionMessage = 'Price Targets bot can be utilized to view price target ' +
    'updates and current price targets provided by various analysts. Price target ' +
    'updates will get displayed at 7AM MST Monday - Friday';

  /** The message to display whenever a help command is received */
  _helpMessage = new MessageEmbed({
    title: 'Help Menu',
    color: '#00D100',
    description: this._descriptionMessage,
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
  _logger = new Logger('Discord');

  /** The welcome message to display */
  _welcomeMessage = new MessageEmbed({
    title: 'Welcome!',
    color: '#00D100',
    description: this._descriptionMessage,
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

  /**
   * @param {string} token The string token to utilize to login the Discord bot
   * @param {Client} client The client to set if provided. Should be utilized for mock purposes 
   */
  constructor(token, client) {
    // Set the mock client for testing if provided
    if (client)
      this._client = client;

    if (token) {
      // Setup handlers
      this._client.on('ready', this._onReady.bind(this));
      this._client.on('messageCreate', this._messageCreate.bind(this));

      // Login Discord bot utilizing the bot token
      this._logger.debug('Discord', 'logging in as Discord bot utilizing token');
      this._client.login(token);
    }
    else {
      this._logger.critical('Discord', 'no token provided, Discord bot will not be started');
    }
  }

  /**
   * Helper function to create a desired Discord channel.
   * 
   * @param {Guild} guild The Discord guild to create the channel in
   * @param {string} channelName The Discord channel to create
   * @returns {Prmose<NonThreadGuildBasedChannel | string>} A promise which will resolve with a Channel
   * or reject with a message
   */
  createChannel(guild, channelName) {
    return new Promise((resolve, reject) => {
      guild.channels.create(channelName, {}).then((channel) => {
        this._logger.debug('createChannel', `successfully created channel ${channelName} for guild ${guild.id}`);
        resolve(channel);
      }).catch((err) => {
        this._logger.warning('createChannel', `failed to create channel ${channelName}`, err);
        reject(err);
      });
    });
  }

  /**
   * Helper function to send a desired message to a desired channel
   * 
   * @param {GuildTextBasedChannel | TextBasedChannel} channel The Discord channel to send the message to
   * @param {MessageEmbed | string} message The desired message to send
   * @returns {Promise<Message | string>} A promise which will resolve with a Message
   * or reject with a message
   */
  sendMessage(channel, message) {
    return new Promise((resolve, reject) => {
      const msg = typeof message === 'string' ? message : { embeds: [message] };
      channel.send(msg).then((response) => {
        this._logger.info('sendMessage', `successfully sent message to ${response.guild.id}`);
        resolve(response);
      }).catch((err) => {
        this._logger.critical('sendMessage', 'error occurred attempting to send message', err);
        reject(err);
      });
    });
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
        this.sendMessage(message.channel, this._helpMessage).then((_) => {
          this._logger.debug('messageCreate', 'successfully replied to help command');
        }).catch((err) => {
          this._logger.debug('messageCreate', 'failed to reply to help command', err);
        });
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
   * Client ready handler. When the bot is logged on, we will check if the guild has the
   * channel that the bot will send updates on, if not, create it with a welcome message.
   */
  _onReady() {
    this._logger.info('onReady', `Discord bot is up an running as ${this._client.user.tag}`);
    this._client.guilds.cache.forEach((guild) => {
      const channel = guild.channels.cache.find(channel => channel.name === this._botChannel);
      if (!channel) {
        this.createChannel(guild, this._botChannel).then((result) => {
          this.sendMessage(result, this._welcomeMessage);
        }).catch((err) => {
          this._logger.warning('onReady', `failed to create channel ${this._botChannel} on ready event`, err);
        });
      }
    });
  }
}

module.exports.Discord = Discord;