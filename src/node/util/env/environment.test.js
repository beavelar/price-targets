const { Environment } = require('./environment.js');

beforeEach(() => {
  delete process.env.INT_VAR;
  delete process.env.FLOAT_VAR;
  delete process.env.STRING_VAR;
});

test('test Environment no options', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test Environment missing env', () => {
  const env = new Environment({
    "INT_VAR": "int",
    "FLOAT_VAR": "float",
    "STRING_VAR": "string"
  });
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test Environment valid env', () => {
  process.env.INT_VAR = '1';
  process.env.FLOAT_VAR = '1.2';
  process.env.STRING_VAR = 'env-value';
  const env = new Environment({
    "INT_VAR": "int",
    "FLOAT_VAR": "float",
    "STRING_VAR": "string"
  });

  expect(env.values.size).toEqual(3);
  expect(env.values.get('INT_VAR')).toEqual(1);
  expect(env.values.get('FLOAT_VAR')).toEqual(1.2);
  expect(env.values.get('STRING_VAR')).toEqual('env-value');
  expect(env.validKeys).toEqual(true);
});

test('test Environment invalid env', () => {
  process.env.INT_VAR = 'string-value-1';
  process.env.FLOAT_VAR = 'string-value-2';
  const env = new Environment({
    "INT_VAR": "int",
    "FLOAT_VAR": "float"
  });

  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test _parseOptions no options', () => {
  const env = new Environment({});
  const parsedOptions = env._parseOptions({});

  expect(parsedOptions.size).toEqual(0);
});

test('test _parseOptions missing env', () => {
  const env = new Environment({});
  const parsedOptions = env._parseOptions({
    "INT_VAR": "int",
    "FLOAT_VAR": "float",
    "STRING_VAR": "string"
  });

  expect(parsedOptions.size).toEqual(0);
});

test('test _parseOptions empty env', () => {
  process.env.INT_VAR = '';
  process.env.FLOAT_VAR = '';
  process.env.STRING_VAR = '';

  const env = new Environment({});
  const parsedOptions = env._parseOptions({
    "INT_VAR": "int",
    "FLOAT_VAR": "float",
    "STRING_VAR": "string"
  });

  expect(parsedOptions.size).toEqual(0);
});

test('test _parseOptions valid env', () => {
  process.env.INT_VAR = '1';
  process.env.FLOAT_VAR = '1.2';
  process.env.STRING_VAR = 'env-value';

  const env = new Environment({});
  const parsedOptions = env._parseOptions({
    "INT_VAR": "int",
    "FLOAT_VAR": "float",
    "STRING_VAR": "string"
  });

  expect(parsedOptions.size).toEqual(3);
  expect(parsedOptions.get('INT_VAR')).toEqual(1);
  expect(parsedOptions.get('FLOAT_VAR')).toEqual(1.2);
  expect(parsedOptions.get('STRING_VAR')).toEqual('env-value');
});

test('test _parseOptions invalid env', () => {
  process.env.INT_VAR = 'string-value-1';
  process.env.FLOAT_VAR = 'string-value-2';

  const env = new Environment({});
  const parsedOptions = env._parseOptions({
    "INT_VAR": "int",
    "FLOAT_VAR": "float"
  });

  expect(parsedOptions.size).toEqual(0);
});

test('test _parseOption valid float', () => {
  process.env.FLOAT_VAR = '1.2';

  const env = new Environment({});
  const parsedOption = env._parseOption('FLOAT_VAR', 'float');

  expect(parsedOption).toEqual(1.2);
});

test('test _parseOption invalid float', () => {
  process.env.FLOAT_VAR = 'string-value';

  const env = new Environment({});
  const parsedOption = env._parseOption('FLOAT_VAR', 'float');

  expect(parsedOption).toBeUndefined();
});

test('test _parseOption valid int', () => {
  process.env.INT_VAR = '1';

  const env = new Environment({});
  const parsedOption = env._parseOption('INT_VAR', 'int');

  expect(parsedOption).toEqual(1);
});

test('test _parseOption invalid int', () => {
  process.env.INT_VAR = 'string-value';

  const env = new Environment({});
  const parsedOption = env._parseOption('INT_VAR', 'int');

  expect(parsedOption).toBeUndefined();
});

test('test _parseOption string', () => {
  process.env.STRING_VAR = 'string-value';

  const env = new Environment({});
  const parsedOption = env._parseOption('STRING_VAR', 'string');

  expect(parsedOption).toEqual('string-value');
});

test('test _parseOption unknown option type', () => {
  process.env.STRING_VAR = 'string-value';

  const env = new Environment({});
  const parsedOption = env._parseOption('STRING_VAR', 'custom-type');

  expect(parsedOption).toBeUndefined();
});