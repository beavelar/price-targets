const { Environment } = require('./environment.js');

test('test Environment no options', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);
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
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  env._parseOptions({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);
});

test('test _parseOptions missing env', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  env._parseOptions({
    "INT_VAR": "int",
    "FLOAT_VAR": "float",
    "STRING_VAR": "string"
  });
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test _parseOptions valid env', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.INT_VAR = '1';
  process.env.FLOAT_VAR = '1.2';
  process.env.STRING_VAR = 'env-value';
  env._parseOptions({
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

test('test _parseOptions invalid env', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.INT_VAR = 'string-value-1';
  process.env.FLOAT_VAR = 'string-value-2';
  env._parseOptions({
    "INT_VAR": "int",
    "FLOAT_VAR": "float"
  });
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test _parseOption valid float', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.FLOAT_VAR = '1.2';
  const valid = env._parseOption('FLOAT_VAR', 'float');

  expect(valid).toEqual(true);
  expect(env.values.size).toEqual(1);
  expect(env.value.get('FLOAT_VAR')).toEqual(1.2);
  expect(env.validKeys).toEqual(true);
});

test('test _parseOption invalid float', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.FLOAT_VAR = 'string-value';
  const valid = env._parseOption('FLOAT_VAR', 'float');

  expect(valid).toEqual(false);
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test _parseOption valid int', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.INT_VAR = '1';
  const valid = env._parseOption('INT_VAR', 'int');

  expect(valid).toEqual(true);
  expect(env.values.size).toEqual(1);
  expect(env.values.get('INT_VAR')).toEqual(1);
  expect(env.validKeys).toEqual(true);
});

test('test _parseOption invalid int', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.INT_VAR = 'string-value';
  const valid = env._parseOption('INT_VAR', 'int');

  expect(valid).toEqual(false);
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});

test('test _parseOption string', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.STRING_VAR = 'string-value';
  const valid = env._parseOption('STRING_VAR', 'string');

  expect(valid).toEqual(true);
  expect(env.values.size).toEqual(1);
  expect(env.values.get('STRING_VAR')).toEqual('string-value');
  expect(env.validKeys).toEqual(true);
});

test('test _parseOption unknown option type', () => {
  const env = new Environment({});
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(true);

  process.env.STRING_VAR = 'string-value';
  const valid = env._parseOption('STRING_VAR', 'custom-type');

  expect(valid).toEqual(false);
  expect(env.values.size).toEqual(0);
  expect(env.validKeys).toEqual(false);
});