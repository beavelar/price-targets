const { Environment } = require('../../util/env/environment.js');
const { Logger } = require('../../util/logger/logger.js');
const { RatingsServer } = require('./server/server.js');

const env = new Environment({
  'RATINGS_REQUEST_URL': 'string',
  'RATINGS_SERVER_PORT': 'int'
});

const logger = new Logger('ratings');

if (env.validKeys) {
  const server = new RatingsServer(env.values.get('RATINGS_REQUEST_URL'));
  server.init(env.values.get('RATINGS_SERVER_PORT'))
}
else {
  logger.critical('init', 'unable to start up ratings server');
}