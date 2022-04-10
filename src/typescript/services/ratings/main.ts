import { Environment } from '../../util/env/environment';
import { Logger } from '../../util/logger/logger';
import { RatingsServer } from './server/server';

const env = new Environment({
  RATINGS_REQUEST_URL: 'string',
  RATINGS_SERVER_PORT: 'int'
});

const logger = new Logger('ratings');

if (env.validKeys) {
  const server = new RatingsServer(env.get('RATINGS_REQUEST_URL') as string);
  server.init(env.get('RATINGS_SERVER_PORT') as string);
}
else {
  logger.critical('init', 'unable to start up ratings server');
}