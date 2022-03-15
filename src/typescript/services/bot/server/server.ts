import express from 'express';
import { Discord } from '../../../util/discord/discord';
import { Logger } from '../../../util/logger/logger';

/**
 * Wrapper for the bot server
 */
export class BotServer {
  /** The bot to send the messages to */
  private bot: Discord;

  /** Logger for BotServer */
  private logger: Logger;

  /** The express server instance */
  private server = express();

  /**
   * @param bot The bot to send the messages to
   */
  constructor(bot: Discord) {
    this.bot = bot;
    this.logger = new Logger('BotServer');
    this.server.use(express.json({ limit: '50mb' }));
    this.server.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.initBotRoute();
  }

  /**
   * Starts up the server to listen on the desired port.
   * 
   * @param port Port to listen on
   */
  /* istanbul ignore next */
  public init(port: string): void {
    this.server.listen(port, () => {
      this.logger.info('init', `server is up and listening on port: ${port}`);
    });
  }

  /**
   * Creates the /bot route and add the logic to run whenever the route is reached.
   */
  /* istanbul ignore next */
  private initBotRoute(): void {
    this.server.post('/bot', (req, res) => {
      this.logger.debug('POST', `received POST request`);
      const msg = this.bot.createEmbedMessage(
        `${req.body.ticker.companyName} (${req.body.ticker.symbol})`,
        '#00D100',
        `Current Price: \$${req.body.ticker.price}`,
        [{
          name: 'Highest Price Target',
          value: `Current: \$${req.body.rating.highest}\nPrevious: \$${req.body.rating_history.highest}`
        }, {
          name: 'Lowest Price Target',
          value: `Current: \$${req.body.rating.lowest}\nPrevious: \$${req.body.rating_history.lowest}`
        }, {
          name: 'Average Price Target',
          value: `Current: \$${req.body.rating.average}\nPrevious: \$${req.body.rating_history.average}`
        }]
      );
      this.bot.sendMessage(msg, undefined).then((botRes) => {
        this.logger.debug('POST', `${botRes} for ${req.body.ticker.symbol}`);
        res.status(200).send(`${botRes} for ${req.body.ticker.symbol}`);
      }).catch((err) => {
        this.logger.critical('POST', `failed to send update to channels for ${req.body.ticker.symbol}`, err);
        res.status(500).send(`failed to send update to channels for ${req.body.ticker.symbol}: ${err}`);
      });
    });
  }
}