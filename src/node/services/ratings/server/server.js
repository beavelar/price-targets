const express = require('express');
const needle = require('needle');
const { Logger } = require('../../../util/logger/logger.js');

/**
 * Wrapper for the rating server
 */
class RatingsServer {
  /** Logger for RatingsServer */
  _logger = new Logger('RatingsServer');

  /** The express server instance */
  _server = express();

  constructor(dataUrl) {
    /* istanbul ignore next */
    if (dataUrl) {
      this._ratingsRoute(dataUrl);
    }
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
   * Helper function to parse through the ratings and retrieve the highest and lowest rating,
   * as well as the average value of all the provided ratings.
   * 
   * @param {[any]} ratings The provided ratings to parse
   * @returns An object containing the highest, lowest, and average value of ratings
   */
  _getLowHighAverage(ratings) {
    this._logger.debug('getLowHighAverage', 'retrieving low, high, and average value of the ratings');
    let lowest = undefined;
    let highest = undefined;
    let total = 0;
    let count = 0;

    for (const rating of ratings) {
      if (rating.priceTarget && rating.priceTarget.value) {
        if (lowest === undefined && highest === undefined) {
          lowest = rating.priceTarget.value;
          highest = rating.priceTarget.value;
        }
        else {
          if (rating.priceTarget.value < lowest)
            lowest = rating.priceTarget.value;
          if (rating.priceTarget.value > highest)
            highest = rating.priceTarget.value;
        }
        total += rating.priceTarget.value;
        count++;
      }
    }

    return {
      average: total / (count !== 0 ? count : 1),
      highest,
      lowest
    };
  }

  /**
   * Creates the /ratings/:ticker route and add the logic to run whenever the
   * route is reached.
   * 
   * @param {string} dataUrl The url to request the data from
   */
  /* istanbul ignore next */
  _ratingsRoute(dataUrl) {
    this._server.get('/ratings/:ticker', (req, res) => {
      const ticker = req.params.ticker.toLowerCase();
      this._logger.debug('GET', `received GET request for ticker ${ticker.toUpperCase()}`);
      needle.get(`${dataUrl}/${ticker}/payload.json`, (err, _res) => {
        if (err) {
          this._logger.critical('GET', 'error occurred attempting to retrieve ratings', err);
          res.status(500).send({ error: `error occurred attempting to retrieve ratings ${err}` });
        }
        else {
          this._logger.debug('GET', 'successfully retrieved ratings data');
          if (_res.body.analysts && _res.body.analysts.ratings) {
            const rating = this._getLowHighAverage(_res.body.analysts.ratings);
            this._logger.debug('GET', 'responding with analyst ratings data');
            res.status(200).send({ data: rating });
          }
        }
      });
    });
  }
}

module.exports.RatingsServer = RatingsServer;