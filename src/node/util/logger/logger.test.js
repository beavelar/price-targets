const { Logger } = require('./logger.js');

beforeEach(() => {
  delete process.env.LOG_LEVEL;
});

test('test Logger DEBUG', () => {
  const logger = new Logger('', 'DEBUG');
  expect(logger.debug('', '')).toEqual(true);
  expect(logger.info('', '')).toEqual(true);
  expect(logger.warning('', '', new Error())).toEqual(true);
  expect(logger.critical('', '', new Error())).toEqual(true);
});

test('test Logger INFO', () => {
  const logger = new Logger('', 'INFO');
  expect(logger.debug('', '')).toEqual(false);
  expect(logger.info('', '')).toEqual(true);
  expect(logger.warning('', '', new Error())).toEqual(true);
  expect(logger.critical('', '', new Error())).toEqual(true);
});

test('test Logger WARNING', () => {
  const logger = new Logger('', 'WARNING');
  expect(logger.debug('', '')).toEqual(false);
  expect(logger.info('', '')).toEqual(false);
  expect(logger.warning('', '', new Error())).toEqual(true);
  expect(logger.critical('', '', new Error())).toEqual(true);
});

test('test Logger CRITICAL', () => {
  const logger = new Logger('', 'CRITICAL');
  expect(logger.debug('', '')).toEqual(false);
  expect(logger.info('', '')).toEqual(false);
  expect(logger.warning('', '', new Error())).toEqual(false);
  expect(logger.critical('', '', new Error())).toEqual(true);
});

test('test _formatDate formatting', () => {
  const logger = new Logger('');
  expect(logger._formatDate(new Date(Date.UTC(2021, 0, 1, 1, 1, 1, 1)))).toEqual('2021-01-01 01:01:01');
  expect(logger._formatDate(new Date(Date.UTC(2021, 10, 10, 10, 10, 10, 10)))).toEqual('2021-11-10 10:10:10');
});

test('test _getLogLevel valid level', () => {
  const logger = new Logger('');
  expect(logger._getLogLevel('DEBUG')).toEqual(0);
  expect(logger._getLogLevel('INFO')).toEqual(1);
  expect(logger._getLogLevel('WARNING')).toEqual(2);
  expect(logger._getLogLevel('CRITICAL')).toEqual(3);
});

test('test _getLogLevel invalid level', () => {
  const logger = new Logger('');
  expect(logger._getLogLevel('invalid')).toEqual(0);
  expect(logger._getLogLevel('log')).toEqual(0);
  expect(logger._getLogLevel('level')).toEqual(0);
  expect(logger._getLogLevel(1)).toEqual(0);
  expect(logger._getLogLevel(1.23)).toEqual(0);
  expect(logger._getLogLevel()).toEqual(0);
});

test('test _getLogLevel valid environment level', () => {
  const logger = new Logger('');

  process.env.LOG_LEVEL = 'DEBUG';
  expect(logger._getLogLevel()).toEqual(0);

  process.env.LOG_LEVEL = 'INFO';
  expect(logger._getLogLevel()).toEqual(1);

  process.env.LOG_LEVEL = 'WARNING';
  expect(logger._getLogLevel()).toEqual(2);

  process.env.LOG_LEVEL = 'CRITICAL';
  expect(logger._getLogLevel()).toEqual(3);
});

test('test _getLogLevel invalid environment level', () => {
  const logger = new Logger('');

  process.env.LOG_LEVEL = 'invalid';
  expect(logger._getLogLevel()).toEqual(0);

  process.env.LOG_LEVEL = 'log';
  expect(logger._getLogLevel()).toEqual(0);

  process.env.LOG_LEVEL = 'level';
  expect(logger._getLogLevel()).toEqual(0);

  process.env.LOG_LEVEL = 1;
  expect(logger._getLogLevel()).toEqual(0);

  process.env.LOG_LEVEL = 1.23;
  expect(logger._getLogLevel()).toEqual(0);

  delete process.env.LOG_LEVEL;
  expect(logger._getLogLevel()).toEqual(0);
});

test('test _validLogLevel valid level', () => {
  const logger = new Logger('');

  expect(logger._validLogLevel('DEBUG')).toEqual(true);
  expect(logger._validLogLevel('INFO')).toEqual(true);
  expect(logger._validLogLevel('WARNING')).toEqual(true);
  expect(logger._validLogLevel('CRITICAL')).toEqual(true);
});

test('test _validLogLevel invalid level', () => {
  const logger = new Logger('');

  expect(logger._validLogLevel('invalid')).toEqual(false);
  expect(logger._validLogLevel('log')).toEqual(false);
  expect(logger._validLogLevel('level')).toEqual(false);
  expect(logger._validLogLevel(1)).toEqual(false);
  expect(logger._validLogLevel(1.23)).toEqual(false);
  expect(logger._validLogLevel()).toEqual(false);
});