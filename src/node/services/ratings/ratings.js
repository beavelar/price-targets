const express = require('express');
const { Logger } = require('../../util/logger/logger.js');

const server = express();
const logger = new Logger('ratings');

server.get('/ratings', (req, res) => {
  logger.debug('GET', 'received GET request');
  res.send('hello :)');
});

server.listen('8090', () => {
  logger.info('init', `server is up and listening on port: 8090`);
});