const express = require('express');
const needle = require('needle');
const { Environment } = require('../../util/env/environment.js');
const { Logger } = require('../../util/logger/logger.js');

const env = new Environment({
  'RATINGS_SERVER_PORT': 'int',
  'RATINGS_REQUEST_URL': 'string'
});

if (env.validKeys) {
  const server = express();
  const logger = new Logger('ratings');

  server.get('/ratings/:ticker', (req, res) => {
    const ticker = req.params.ticker.toLocaleLowerCase();
    logger.debug('GET', `received GET request for ticker ${ticker}`);
    needle.get(`${env.values.get('RATINGS_REQUEST_URL')}/${ticker}/payload.json`, (err, _res) => {
      if (err) {
        logger.critical('GET', 'error occurred attempting to retrieve ratings', err);
        res.status(500).send({ error: `error occurred attempting to retrieve ratings ${err}` });
      }
      else {
        logger.debug('GET', 'successfully retrieved ratings data');
        if (_res.body.analysts && _res.body.analysts.ratings) {
          logger.debug('GET', 'responding with analyst ratings data');
          res.status(200).send({ data: _res.body.analysts.ratings });
        }
      }
    });
  });

  server.listen(`${env.values.get('RATINGS_SERVER_PORT')}`, () => {
    logger.info('init', `server is up and listening on port: ${env.values.get('RATINGS_SERVER_PORT')}`);
  });
}