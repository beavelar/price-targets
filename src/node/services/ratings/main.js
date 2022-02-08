const { Environment } = require('../../util/env/environment.js');
const { Logger } = require('../../util/logger/logger.js');
const { RatingsServer } = require('./server/server.js');

const env = new Environment({
  'RATINGS_REQUEST_URL': 'string',
  'RATINGS_SERVER_PORT': 'int',
  'TICKER_SERVICE_ENDPOINT': 'string'
});

const logger = new Logger('ratings');

if (env.validKeys) {
  const server = new RatingsServer(env.get('RATINGS_REQUEST_URL'), env.get('TICKER_SERVICE_ENDPOINT'));
  server.init(env.get('RATINGS_SERVER_PORT'))
}
else {
  logger.critical('init', 'unable to start up ratings server');
}