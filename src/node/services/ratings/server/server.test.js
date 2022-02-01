const { RatingsServer } = require('./server.js');

test('test _getLowHighAverage no ratings', () => {
  const server = new RatingsServer();
  const result = server._getLowHighAverage([]);

  const expectedResult = {
    average: 0,
    highest: undefined,
    lowest: undefined
  };

  expect(result).toEqual(expectedResult);
});

test('test _getLowHighAverage one rating', () => {
  const server = new RatingsServer();
  const result = server._getLowHighAverage([{
    priceTarget: { value: 20 }
  }]);

  const expectedResult = {
    average: 20,
    highest: 20,
    lowest: 20
  };

  expect(result).toEqual(expectedResult);
});

test('test _getLowHighAverage many ratings', () => {
  const server = new RatingsServer();
  const result = server._getLowHighAverage([{
    priceTarget: { value: 10 }
  }, {
    priceTarget: { value: 15 }
  }, {
    priceTarget: { value: 20 }
  }, {
    priceTarget: { value: 5 }
  }, {
    priceTarget: { value: 13 }
  }]);

  const expectedResult = {
    average: 12.6,
    highest: 20,
    lowest: 5
  };

  expect(result).toEqual(expectedResult);
});