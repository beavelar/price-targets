import { Logger } from './logger';
import { LogLevel } from './level';

describe('Logger test suite', () => {
  beforeEach(() => {
    delete process.env.LOG_LEVEL;
  });

  test('test Logger DEBUG', () => {
    const logger = new Logger('', LogLevel.DEBUG);
    expect(logger.debug('', '')).toEqual(true);
    expect(logger.info('', '')).toEqual(true);
    expect(logger.warning('', '', new Error())).toEqual(true);
    expect(logger.critical('', '', new Error())).toEqual(true);
  });

  test('test Logger INFO', () => {
    const logger = new Logger('', LogLevel.INFO);
    expect(logger.debug('', '')).toEqual(false);
    expect(logger.info('', '')).toEqual(true);
    expect(logger.warning('', '', new Error())).toEqual(true);
    expect(logger.critical('', '', new Error())).toEqual(true);
  });

  test('test Logger WARNING', () => {
    const logger = new Logger('', LogLevel.WARNING);
    expect(logger.debug('', '')).toEqual(false);
    expect(logger.info('', '')).toEqual(false);
    expect(logger.warning('', '', new Error())).toEqual(true);
    expect(logger.critical('', '', new Error())).toEqual(true);
  });

  test('test Logger CRITICAL', () => {
    const logger = new Logger('', LogLevel.CRITICAL);
    expect(logger.debug('', '')).toEqual(false);
    expect(logger.info('', '')).toEqual(false);
    expect(logger.warning('', '', new Error())).toEqual(false);
    expect(logger.critical('', '', new Error())).toEqual(true);
  });

  test('test Logger TESTING', () => {
    const logger = new Logger('', LogLevel.TESTING);
    expect(logger.debug('', '')).toEqual(false);
    expect(logger.info('', '')).toEqual(false);
    expect(logger.warning('', '', new Error())).toEqual(false);
    expect(logger.critical('', '', new Error())).toEqual(false);
  });
});