const { Logger } = require('./logger.js');

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