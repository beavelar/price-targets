import {
  Client,
  EmbedFieldData,
  Guild,
  GuildTextBasedChannel,
  HexColorString,
  Intents,
  Message,
  MessageEmbed,
  NonThreadGuildBasedChannel,
} from 'discord.js';
import { Logger } from '../logger/logger';
import needle from 'needle';
import { RealtimeData } from './realtime-data';

/**
 * Basic wrapper of the Discord bot client implementation
 */
export class Discord {
  /** The channel the bot will create and send messages too */
  private botChannel: string;

  /** The Discord bot client */
  private client: Client;

  /** The description of the help/welcome message */
  private descMsg: string;

  /** The message fields of the help/welcome message */
  private msgFields: Array<EmbedFieldData>;

  /** The message to display whenever a help command is received */
  private helpMessage: MessageEmbed;

  /** Logger for Discord */
  private logger: Logger;

  /** The URI of the realtime service */
  private realtimeUri: string;

  /** The welcome message to display */
  /** The message to display whenever a help command is received */
  private welcomeMessage: MessageEmbed;

  /**
   * @param token The string token to utilize to login the Discord bot
   * @param realtimeUri The URI string of the realtime service
   * @param client The client to set if provided. Should be utilized for mock purposes 
   */
  constructor(token: string, realtimeUri: string, client?: Client) {
    this.botChannel = 'price-targets';
    this.descMsg = 'Price Targets bot can be utilized to view price target ' +
      'updates and current price targets provided by various analysts. Price target ' +
      'updates will get displayed at 7AM MST Monday - Friday';
    this.msgFields = [{
      name: 'Commands',
      value: '`pt!rating`, `pt!help`'
    }, {
      name: '__pt!rating__',
      value: 'Request the current lowest, highest, and average price targets provided by various analysts'
    }, {
      name: '__pt!help__',
      value: 'Display the help menu to view all available commands'
    }];
    this.helpMessage = this.createEmbedMessage(
      'Help Menu',
      '#00D100',
      this.descMsg,
      this.msgFields
    );
    this.logger = new Logger('Discord');
    this.realtimeUri = realtimeUri;
    this.welcomeMessage = this.createEmbedMessage(
      'Welcome!',
      '#00D100',
      this.descMsg,
      this.msgFields
    );

    // Set the mock client for testing if provided
    if (client)
      this.client = client;
    else
      this.client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        partials: ['MESSAGE', 'CHANNEL']
      });

    if (token) {
      // Setup handlers
      this.client.on('ready', this.onReady.bind(this));
      this.client.on('messageCreate', this.messageCreate.bind(this));

      // Login Discord bot utilizing the bot token
      this.logger.debug('Discord', 'logging in as Discord bot utilizing token');
      this.client.login(token);
    }
    else {
      this.logger.critical('Discord', 'no token provided, Discord bot will not be started');
    }
  }

  /**
   * Helper function to create a desired Discord channel.
   * 
   * @param guild The Discord guild to create the channel in
   * @param channelName The Discord channel to create
   * @returns A promise which will resolve with a Channel
   * or reject with a message
   */
  public createChannel(guild: Guild, channelName: string): Promise<NonThreadGuildBasedChannel> {
    return new Promise((resolve, reject) => {
      guild.channels.create(channelName, {}).then((channel) => {
        this.logger.debug('createChannel', `successfully created channel ${channelName} for guild ${guild.id}`);
        resolve(channel);
      }).catch((err: Error) => {
        this.logger.warning('createChannel', `failed to create channel ${channelName}`, err);
        reject(err);
      });
    });
  }

  /**
   * Helper function to create the Discord embed messages
   * 
   * @param title The title of the messages
   * @param color The embedded color of the message
   * @param descMsg The description of the message
   * @param fields The fields (body) of the message
   * @returns The create Discord embed message
   */
  public createEmbedMessage(title: string, color: HexColorString, descMsg: string, fields: Array<EmbedFieldData>): MessageEmbed {
    return new MessageEmbed({
      title: title,
      color: color,
      description: descMsg,
      fields: fields
    });
  }

  /**
   * Helper function to send a desired message to a desired channel
   * 
   * @param channel The Discord channel to send the message to. If channel is undefined,
   * message will be sent to all bot channels. 
   * @param message The desired message to send
   * @returns A promise which will resolve with a Message or reject with a message
   */
  public sendMessage(message: MessageEmbed, channel?: GuildTextBasedChannel): Promise<Message> {
    return new Promise((resolve, reject) => {
      const embed = { embeds: [message] };
      const channels = new Array<GuildTextBasedChannel>();

      if (channel) {
        channels.push(channel);
      }
      else {
        const guilds = this.client.guilds.cache.map((guild) => {
          return guild;
        });

        for (const guild of guilds) {
          const channel = guild.channels.cache.find(channel => channel.name === this.botChannel) as GuildTextBasedChannel;
          if (channel) {
            channels.push(channel);
          }
        }
      }

      if (channels.length !== 0) {
        for (const channel of channels) {
          channel.send(embed).then((response) => {
            this.logger.info('sendMessage', `successfully sent message to ${response.guild?.id ?? 'channel'}`);
            resolve(response);
          }).catch((err: Error) => {
            this.logger.critical('sendMessage', 'error occurred attempting to send message', err);
            reject(err);
          });
        }
      }
      else {
        reject('no channels provided to send message to, ignoring request');
      }
    });
  }

  /**
   * Client messageCreate handler. We will handle the message here.
   * 
   * @param message The message caught by the messageCreate event
   */
  private messageCreate(message: Message) {
    if (message.author.bot) return;
    this.logger.debug('messageCreate', 'received messageCreate event');

    if (message.content.startsWith('pt!')) {
      this.logger.debug('messageCreate', 'received pt! trigger');
      const command = message.content.replace('pt!', '').trim();

      if (command.startsWith('help')) {
        this.logger.info('messageCreate', 'received help command');
        this.sendMessage(this.helpMessage, message.channel as GuildTextBasedChannel).then((_) => {
          this.logger.debug('messageCreate', 'successfully replied to help command');
        }).catch((err) => {
          this.logger.warning('messageCreate', 'failed to reply to help command', err);
        });
      }
      else if (command.startsWith('rating')) {
        this.logger.info('messageCreate', 'received rating command');
        const ticker = command.replace('rating', '').trim().toUpperCase();
        this.requestRealtimeData(ticker).then((data) => {
          this.logger.debug('messageCreate', `successfully retrieved realtime data for ${ticker}`);
          this.logger.debug('messageCreate', JSON.stringify(data));
          const msg = this.createEmbedMessage(
            `${data.ticker.companyName} (${data.ticker.symbol})`,
            '#00D100',
            `Current Price: \$${data.ticker.price}`,
            [{
              name: 'Highest Price Target',
              value: `Current: \$${data.rating.highest}\nPrevious: \$${data.rating_history.highest}`
            }, {
              name: 'Lowest Price Target',
              value: `Current: \$${data.rating.lowest}\nPrevious: \$${data.rating_history.lowest}`
            }, {
              name: 'Average Price Target',
              value: `Current: \$${data.rating.average}\nPrevious: \$${data.rating_history.average}`
            }]
          );
          this.sendMessage(msg, message.channel as GuildTextBasedChannel);
        }).catch((err) => {
          this.logger.critical('messageCreate', `error occurred requesting realtime data for ${ticker}`, err);
        });
      }
      else {
        this.logger.warning('messageCreate', `unknown command received: ${command}`);
      }
    }
  }

  /**
   * Client ready handler. When the bot is logged on, we will check if the guild has the
   * channel that the bot will send updates on, if not, create it with a welcome message.
   */
  private onReady() {
    this.logger.info('onReady', `Discord bot is up an running as ${this.client?.user?.tag ?? 'bot'}`);
    this.client.guilds.cache.forEach((guild) => {
      const channel = guild.channels.cache.find(channel => channel.name === this.botChannel);
      if (!channel) {
        this.createChannel(guild, this.botChannel).then((result) => {
          this.sendMessage(this.welcomeMessage, result as GuildTextBasedChannel);
        }).catch((err) => {
          this.logger.warning('onReady', `failed to create channel ${this.botChannel} on ready event`, err);
        });
      }
    });
  }

  /**
   * Helper function to request realtime data from the realtime service.
   * 
   * @param ticker The desired ticker to request data for
   * @returns A promise which will resolve to the response from the realtime service or
   * reject with a string
   */
  /* istanbul ignore next */
  private requestRealtimeData(ticker: string): Promise<RealtimeData> {
    return new Promise((resolve, reject) => {
      this.logger.debug('requestRealtimeData', `requesting realtime data for ${ticker}`);
      needle.get(`${this.realtimeUri}?symbol=${ticker}`, (err, res) => {
        if (err) {
          reject(new Error(`error occurred querying realtime service for data on ${ticker}: ${err}`));
        }
        else {
          resolve(typeof res.body === 'string' ? JSON.parse(res.body) : res.body);
        }
      });
    });
  }
}