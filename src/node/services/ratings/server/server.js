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
   * Creates the /ratings/:ticker route and add the logic to run whenever the
   * route is reached.
   * 
   * @param {string} dataUrl The url to request the data from
   */
  /* istanbul ignore next */
  _ratingsRoute(dataUrl) {
    this._server.get('/ratings/:ticker', (req, res) => {
      const ticker = req.params.ticker.toLocaleLowerCase();
      this._logger.debug('GET', `received GET request for ticker ${ticker}`);
      needle.get(`${dataUrl}/${ticker}/payload.json`, (err, _res) => {
        if (err) {
          this._logger.critical('GET', 'error occurred attempting to retrieve ratings', err);
          res.status(500).send({ error: `error occurred attempting to retrieve ratings ${err}` });
        }
        else {
          this._logger.debug('GET', 'successfully retrieved ratings data');
          if (_res.body.analysts && _res.body.analysts.ratings) {
            this._logger.debug('GET', 'responding with analyst ratings data');
            res.status(200).send({ data: _res.body.analysts.ratings });
          }
        }
      });
    });
  }
}

module.exports.RatingsServer = RatingsServer;