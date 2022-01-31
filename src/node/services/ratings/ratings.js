const express = require('express');
const { Environment } = require('../../util/env/environment.js');
const { Logger } = require('../../util/logger/logger.js');

const env = new Environment({ 'RATINGS_SERVER_PORT': 'int' });
if (env.validKeys) {
  const server = express();
  const logger = new Logger('ratings');

  server.get('/ratings', (req, res) => {
    logger.debug('GET', 'received GET request');
    res.send('hello :)');
  });

  server.listen(`${env.values.get('RATINGS_SERVER_PORT')}`, () => {
    logger.info('init', `server is up and listening on port: ${env.values.get('RATINGS_SERVER_PORT')}`);
  });
}