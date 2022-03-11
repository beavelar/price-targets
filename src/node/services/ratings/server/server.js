const express = require('express');
const needle = require('needle');
const { Logger } = require('../../../util/logger/logger.js');

/**
 * Wrapper for the rating server
 */
class RatingsServer {
  /** The URL of the data provider */
  _dataUrl;

  /** Logger for RatingsServer */
  _logger = new Logger('RatingsServer');

  /** The express server instance */
  _server = express();

  constructor(dataUrl) {
    this._dataUrl = dataUrl;

    /* istanbul ignore next */
    if (this._dataUrl) {
      this._initRatingsRoute();
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
   * Helper function to request data from the analyst data api.
   * 
   * @param {string} ticker The ticker to request data for from the ticker service
   * @returns {Promise<{average: number, highest: number, lowest: number} | string>} A promise
   * which will resolve to the parsed data from the data retrieved or reject with a string message
   */
  /* istanbul ignore next */
  _dataRequest(ticker) {
    return new Promise((resolve, reject) => {
      needle.get(`${this._dataUrl}/${ticker.toLowerCase()}/payload.json`, (err, res) => {
        if (err) {
          this._logger.critical('dataRequest', 'error occurred attempting to retrieve ratings', err);
          reject(`error occurred attempting to retrieve ratings: ${err}`);
        }
        else {
          this._logger.debug('dataRequest', `successfully retrieved ratings data for ${ticker}`);
          if (res.body.analysts && res.body.analysts.ratings) {
            resolve(this._getLowHighAverage(res.body.analysts.ratings));
          }
          else {
            this._logger.critical('dataRequest', 'no analyst ratings returned from analyst data request');
            reject('no analyst ratings returned from analyst data request');
          }
        }
      });
    });
  }

  /**
   * Helper function to parse through the ratings and retrieve the highest and lowest rating,
   * as well as the average value of all the provided ratings.
   * 
   * @param {[any]} ratings The provided ratings to parse
   * @returns {{average: number, highest: number, lowest: number}} An object containing the highest,
   * lowest, and average value of ratings
   */
  _getLowHighAverage(ratings) {
    this._logger.debug('getLowHighAverage', 'retrieving low, high, and average value of the ratings');
    let lowest;
    let highest;
    let total = 0;
    let count = 0;

    for (const rating of ratings) {
      const weight = rating.expert.avgReturn > 0 ? 1 : 0;
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
        total += (weight * rating.priceTarget.value);
        count++;
      }
    }

    return {
      average: parseFloat((total / (count !== 0 ? count : 1)).toFixed(2)),
      highest,
      lowest
    };
  }

  /**
   * Creates the /ratings/:ticker route and add the logic to run whenever the
   * route is reached.
   */
  /* istanbul ignore next */
  _initRatingsRoute() {
    this._server.get('/ratings/:ticker', (req, res) => {
      const ticker = req.params.ticker.toUpperCase();
      this._logger.debug('GET', `received GET request for ticker ${ticker}`);

      this._dataRequest(ticker.toLowerCase()).then((ratingData) => {
        this._logger.debug('GET', `responding with analyst ratings data for ${ticker}`);
        res.status(200).send(ratingData);
      }).catch((err) => {
        this._logger.warning('GET', err);
        res.status(500).send(err);
      });
    });
  }
}

module.exports.RatingsServer = RatingsServer;