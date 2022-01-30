const { Logger } = require('./logger.js');

beforeEach(() => {
  delete process.env.LOG_LEVEL;
});

test('test Logger DEBUG', () => {
  const logger = new Logger('', 'DEBUG');
  expect(logger.debug('', '')).toEqual(true);
  expect(logger.info('', '')).toEqual(true);
  expect(logger.warning('', '')).toEqual(true);
  expect(logger.critical('', '')).toEqual(true);
});

test('test Logger INFO', () => {
  const logger = new Logger('', 'INFO');
  expect(logger.debug('', '')).toEqual(false);
  expect(logger.info('', '')).toEqual(true);
  expect(logger.warning('', '')).toEqual(true);
  expect(logger.critical('', '')).toEqual(true);
});

test('test Logger WARNING', () => {
  const logger = new Logger('', 'WARNING');
  expect(logger.debug('', '')).toEqual(false);
  expect(logger.info('', '')).toEqual(false);
  expect(logger.warning('', '')).toEqual(true);
  expect(logger.critical('', '')).toEqual(true);
});

test('test Logger CRITICAL', () => {
  const logger = new Logger('', 'CRITICAL');
  expect(logger.debug('', '')).toEqual(false);
  expect(logger.info('', '')).toEqual(false);
  expect(logger.warning('', '')).toEqual(false);
  expect(logger.critical('', '')).toEqual(true);
});

test('test formatDate formatting', () => {
  const logger = new Logger('');
  expect(logger._formatDate(new Date(Date.UTC(2021)))).toEqual('2021-01-01 00:00:00');
  expect(logger._formatDate(new Date(Date.UTC(2021, 1)))).toEqual('2021-02-01 00:00:00');
  expect(logger._formatDate(new Date(Date.UTC(2021, 1, 3)))).toEqual('2021-02-03 00:00:00');
  expect(logger._formatDate(new Date(Date.UTC(2021, 1, 3, 4)))).toEqual('2021-02-03 04:00:00');
  expect(logger._formatDate(new Date(Date.UTC(2021, 1, 3, 4, 5)))).toEqual('2021-02-03 04:05:00');
  expect(logger._formatDate(new Date(Date.UTC(2021, 1, 3, 4, 5, 6)))).toEqual('2021-02-03 04:05:06');
  expect(logger._formatDate(new Date(Date.UTC(2021, 1, 3, 4, 5, 6, 7)))).toEqual('2021-02-03 04:05:06');
});

test('test getLogLevel valid level', () => {
  const logger = new Logger('');
  expect(logger._getLogLevel('DEBUG')).toEqual(0);
  expect(logger._getLogLevel('INFO')).toEqual(1);
  expect(logger._getLogLevel('WARNING')).toEqual(2);
  expect(logger._getLogLevel('CRITICAL')).toEqual(3);
});

test('test getLogLevel invalid level', () => {
  const logger = new Logger('');
  expect(logger._getLogLevel('invalid')).toEqual(0);
  expect(logger._getLogLevel('log')).toEqual(0);
  expect(logger._getLogLevel('level')).toEqual(0);
  expect(logger._getLogLevel(1)).toEqual(0);
  expect(logger._getLogLevel(1.23)).toEqual(0);
  expect(logger._getLogLevel()).toEqual(0);
});

test('test getLogLevel valid environment level', () => {
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

test('test getLogLevel invalid environment level', () => {
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

test('test validLogLevel valid level', () => {
  const logger = new Logger('');

  expect(logger._validLogLevel('DEBUG')).toEqual(true);
  expect(logger._validLogLevel('INFO')).toEqual(true);
  expect(logger._validLogLevel('WARNING')).toEqual(true);
  expect(logger._validLogLevel('CRITICAL')).toEqual(true);
});

test('test validLogLevel invalid level', () => {
  const logger = new Logger('');

  expect(logger._validLogLevel('invalid')).toEqual(false);
  expect(logger._validLogLevel('log')).toEqual(false);
  expect(logger._validLogLevel('level')).toEqual(false);
  expect(logger._validLogLevel(1)).toEqual(false);
  expect(logger._validLogLevel(1.23)).toEqual(false);
  expect(logger._validLogLevel()).toEqual(false);
});