import { Environment } from './environment';

describe('Environment test suite', () => {
  process.env.LOG_LEVEL = 'TESTING';

  beforeEach(() => {
    delete process.env.INT_VAR;
    delete process.env.FLOAT_VAR;
    delete process.env.STRING_VAR;
  });

  test('test Environment no options', () => {
    const env = new Environment({});
    expect(env.validKeys).toEqual(false);
  });

  test('test Environment missing env', () => {
    const env = new Environment({
      "INT_VAR": "int",
      "FLOAT_VAR": "float",
      "STRING_VAR": "string"
    });
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

    expect(env.get('INT_VAR')).toEqual(1);
    expect(env.get('FLOAT_VAR')).toEqual(1.2);
    expect(env.get('STRING_VAR')).toEqual('env-value');
    expect(env.validKeys).toEqual(true);
  });

  test('test Environment invalid env', () => {
    process.env.INT_VAR = 'string-value-1';
    process.env.FLOAT_VAR = 'string-value-2';
    const env = new Environment({
      "INT_VAR": "int",
      "FLOAT_VAR": "float"
    });

    expect(env.validKeys).toEqual(false);
  });

  test('test get no env', () => {
    const env = new Environment({});

    expect(env.get('INT_VAR')).toBeUndefined();
    expect(env.get('FLOAT_VAR')).toBeUndefined();
    expect(env.get('STRING_VAR')).toBeUndefined();
  });

  test('test get fallback no env', () => {
    const env = new Environment({});

    expect(env.get('INT_VAR', 1)).toEqual(1);
    expect(env.get('FLOAT_VAR', 1.23)).toEqual(1.23);
    expect(env.get('STRING_VAR', 'string-value')).toEqual('string-value');
  });

  test('test get env', () => {
    process.env.INT_VAR = '1';
    process.env.FLOAT_VAR = '1.23';
    process.env.STRING_VAR = 'string-value';
    const env = new Environment({
      "INT_VAR": "int",
      "FLOAT_VAR": "float",
      "STRING_VAR": "string"
    });

    expect(env.get('INT_VAR')).toEqual(1);
    expect(env.get('FLOAT_VAR')).toEqual(1.23);
    expect(env.get('STRING_VAR')).toEqual('string-value');
  });

  test('test get env ignore fallback', () => {
    process.env.INT_VAR = '1';
    process.env.FLOAT_VAR = '1.23';
    process.env.STRING_VAR = 'string-value';
    const env = new Environment({
      "INT_VAR": "int",
      "FLOAT_VAR": "float",
      "STRING_VAR": "string"
    });

    expect(env.get('INT_VAR', 2)).toEqual(1);
    expect(env.get('FLOAT_VAR', 2.13)).toEqual(1.23);
    expect(env.get('STRING_VAR', 'string-value-1')).toEqual('string-value');
  });
});