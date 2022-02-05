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
   */
  constructor(token) {
    if (token) {
      // Setup handlers
      this._client.on('ready', this._onReady.bind(this));
      this._client.on('messageCreate', this._messageCreate.bind(this));

      // Login Discord bot utilizing the bot token
      this._logger.debug('Discord', 'logging in as Discord bot utilizing token');
      this._client.login(token);
    }
    else {
      this._logger.critical('Discord', 'no toekn provided, Discord bot will not be started');
    }
  }

  /**
   * Helper function to create a desired Discord channel. If a welcome message is provided,
   * we will send the message in the newly created channel as soon as it's created.
   * 
   * @param {Guild} guild The Discord guild to create the channel in
   * @param {string} channelName The Discord channel to create
   * @param {string | MessageEmbed | undefined} message The welcome message to send if provided
   */
  _createChannel(guild, channelName, welcomeMessage) {
    guild.channels.create(channelName).then((channel) => {
      this._logger.debug('createChannel', `successfully created channel ${channelName} for guild ${guild.id}`);
      if (welcomeMessage) {
        this._sendMessage(channel, welcomeMessage);
      }
    }).catch((err) => {
      this._logger.warning('creationChannel', `failed to create channel ${channelName}`, err);
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
   * Client ready handler. When the bot is logged on, we will check if the guild has the
   * channel that the bot will send updates on, if not, create it with a welcome message.
   */
  _onReady() {
    this._logger.info('onReady', `Discord bot is up an running as ${this._client.user.tag}`);
    this._client.guilds.cache.forEach((guild) => {
      const channel = guild.channels.cache.find(channel => channel.name === this._botChannel);
      if (!channel) {
        this._createChannel(guild, this._botChannel, this._welcomeMessage);
      }
    });
  }

  /**
   * Helper function to send a desired message to a desired channel
   * 
   * @param {Channel} channel The Discord channel to send the message to
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