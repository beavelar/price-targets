const express = require('express');
const needle = require('needle');
const { Logger } = require('../../../util/logger/logger.js');

/**
 * Wrapper for the rating server
 */
class RatingsServer {
  /** The URL of the data provider */
  _dataUrl = undefined;

  /** Logger for RatingsServer */
  _logger = new Logger('RatingsServer');

  /** The express server instance */
  _server = express();

  /** The URL of the ticker service */
  _tickerUrl = undefined;

  constructor(dataUrl, tickerUrl) {
    this._dataUrl = dataUrl;
    this._tickerUrl = tickerUrl;

    /* istanbul ignore next */
    if (this._dataUrl && this._tickerUrl) {
      this._ratingsRoute();
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
   * @returns {Promise<{error: string} | {average: number, highest: number, lowest: number}>} A promise
   * which will resolve to the parse data from the data retrieved or reject with a message
   */
  /* istanbul ignore next */
  _dataRequest(ticker) {
    return new Promise((resolve, reject) => {
      needle.get(`${this._dataUrl}/${ticker.toLowerCase()}/payload.json`, (err, res) => {
        if (err) {
          this._logger.critical('dataRequest', 'error occurred attempting to retrieve ratings', err);
          reject({ error: 'error occurred attempting to retrieve ratings', trace: err });
        }
        else {
          this._logger.debug('dataRequest', `successfully retrieved ratings data for ${ticker}`);
          if (res.body.analysts && res.body.analysts.ratings) {
            resolve(this._getLowHighAverage(res.body.analysts.ratings));
          }
          resolve({ average: 0, highest: 0, lowest: 0 });
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
   */
  /* istanbul ignore next */
  _ratingsRoute() {
    this._server.get('/ratings/:ticker', (req, res) => {
      const ticker = req.params.ticker.toUpperCase();
      this._logger.debug('GET', `received GET request for ticker ${ticker}`);

      this._tickerRequest(ticker).then((tickerData) => {
        this._dataRequest(ticker.toLowerCase()).then((ratingData) => {
          this._logger.debug('GET', `responding with analyst ratings data for ${ticker}`);
          res.status(200).send({ info: tickerData, rating: ratingData });
        }).catch((dataErr) => {
          this._logger.warning('GET', dataErr.error, dataErr.trace);
          res.status(500).send(tickerErr);
        });
      }).catch((tickerErr) => {
        this._logger.warning('GET', tickerErr.error, tickerErr.trace);
        res.status(500).send(tickerErr);
      });
    });
  }

  /**
   * Helper function to request data from the ticker service.
   * 
   * @param {string} ticker The ticker to request data for from the ticker service
   * @returns {Promise<{error: string} | {companyName: string, price: number, symbol: string}>} A promise which
   * will resolve/reject to the response/error from the ticker service
   */
  /* istanbul ignore next */
  _tickerRequest(ticker) {
    return new Promise((resolve, reject) => {
      needle.get(`${this._tickerUrl}?symbol=${ticker}`, (err, res) => {
        if (err) {
          this._logger.critical('tickerRequest', 'error occurred attempting to reach ticker service', err);
          reject({ error: 'error occurred attempting to reach ticker service', trace: err });
        }
        else {
          const response = JSON.parse(res.body);
          if (response.error) {
            this._logger.warning('tickerRequest', `invalid ticker provided (${ticker}), unable to retrieve data`, response.error);
            reject({ error: `invalid ticker provided (${ticker}), unable to retrieve data`, trace: response.error });
          }
          else {
            this._logger.debug('tickerRequest', `successfully received ticker data for ${ticker}`);
            resolve(response);
          }
        }
      });
    });
  }
}

module.exports.RatingsServer = RatingsServer;