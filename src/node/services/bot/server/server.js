const express = require('express');
const { Discord } = require('../../../util/discord/discord.js');
const { Logger } = require('../../../util/logger/logger.js');

/**
 * Wrapper for the bot server
 */
class BotServer {
  /** The bot to send the messages to */
  _bot;

  /** Logger for BotServer */
  _logger = new Logger('BotServer');

  /** The express server instance */
  _server = express();

  /**
   * @param {Discord} bot The bot to send the messages to
   */
  constructor(bot) {
    this._bot = bot;
    this._server.use(express.json({ limit: '50mb' }));
    this._server.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this._initBotRoute();
  }

  /**
   * Starts up the server to listen on the desired port.
   * 
   * @param {string} port Port to listen on
   */
  /* istanbul ignore next */
  init(port) {
    this._server.listen(port, () => {
      this._logger.info('init', `server is up and listening on port: ${port}`);
    });
  }

  /**
   * Creates the /bot route and add the logic to run whenever the
   * route is reached.
   */
  /* istanbul ignore next */
  _initBotRoute() {
    this._server.post('/bot', (req, res) => {
      this._logger.debug('POST', `received POST request`);
      let highestArrow = '';
      let lowestArrow = '';
      let averageArrow = '';
      let embedColor = 'A9A9A9';

      if (req.body.rating.highest > req.body.rating_history.highest)
        highestArrow = ' :arrow_up:';
      else if (req.body.rating.highest < req.body.rating_history.highest)
        highestArrow = ' :arrow_down:';

      if (req.body.rating.lowest > req.body.rating_history.lowest)
        lowestArrow = ' :arrow_up:';
      else if (req.body.rating.lowest < req.body.rating_history.lowest)
        lowestArrow = ' :arrow_down:';

      if (req.body.rating.average > req.body.rating_history.average) {
        averageArrow = ' :arrow_up:';
        embedColor = '#00D100';
      }
      else if (req.body.rating.average < req.body.rating_history.average) {
        averageArrow = ' :arrow_down:';
        embedColor = '#FF0000';
      }

      const msg = this._bot.createEmbedMessage(
        `${req.body.ticker.companyName} (${req.body.ticker.symbol})`,
        embedColor,
        `Current Price: \$${req.body.ticker.price}`,
        [{
          name: `Highest Price Target${highestArrow}`,
          value: `Current: \$${req.body.rating.highest}\nPrevious: \$${req.body.rating_history.highest}`
        }, {
          name: `Lowest Price Target${lowestArrow}`,
          value: `Current: \$${req.body.rating.lowest}\nPrevious: \$${req.body.rating_history.lowest}`
        }, {
          name: 'Average Price Target',
          value: `Current: \$${req.body.rating.average}\nPrevious: \$${req.body.rating_history.average}`
        }]
      );
      this._bot.sendMessage(undefined, msg).then((botRes) => {
        this._logger.debug('POST', `${botRes} for ${req.body.ticker.symbol}`);
        res.status(200).send(`${botRes} for ${req.body.ticker.symbol}`);
      }).catch((err) => {
        this._logger.critical('POST', `failed to send update to channels for ${req.body.ticker.symbol}`, err);
        res.status(500).send(`failed to send update to channels for ${req.body.ticker.symbol}: ${err}`);
      });
    });
  }
}

module.exports.BotServer = BotServer;