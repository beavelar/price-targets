const { Logger } = require('../logger/logger.js');

/**
 * Interface which will be responsible for containing the application environment
 * variables.
 */
class Environment {
  /** Flag indicating if consumed keys are valid */
  validKeys = true;

  /** Map which will contain the parse environment variables */
  values = new Map();

  /** Logger for Environment */
  _logger = new Logger('env');

  /**
   * @param {{[key: string]: string}} options The provided options to attempt to parse
   * and to parse to. The key should be the environment variable to attempt to parse
   * and the value should be the type to attempt to parse to.
   */
  constructor(options) {
    this.values = this._parseOptions(options);
    if (this.values.size === 0) {
      this.validKeys = false;
    }
  }

  /**
   * With the provided options, will attempt to retrieve the each desired environment
   * variable from the process environment and parse to the desired option type.
   * 
   * @param {{[key: string]: string}} options The provided options to attempt to parse
   * and to parse to. The key should be the environment variable to attempt to parse
   * and the value should be the type to attempt to parse to.
   * @returns {Map<string, string>} A map containing the result. If any of the options are unable to be
   * parsed, the map will be empty.
   */
  _parseOptions(options) {
    const result = new Map();
    for (const key in options) {
      this._logger.debug('parseOptions', `parsing environment option ${key} of type ${options[key]}`);
      const parsedOption = this._parseOption(key, options[key]);
      result.set(key, parsedOption);

      if (parsedOption === undefined) {
        this._logger.critical('parseOptions', `unable to parse provided options`);
        return new Map();
      }
    }
    return result;
  }

  /**
   * With the provided option and optionType, will try to retrieve the environment
   * variable from the process environment and parse to the desired variable type.
   * 
   * @param {string} option The environment variable to attempt to parse 
   * @param {string} optionType What to attempt to parse the environment variable to.
   * Valid options are 'float', 'int', and 'string'
   * @returns {number | string | undefined} The parsed option to the desired type or undefined if invalid
   */
  _parseOption(option, optionType) {
    let result = undefined;
    if (process.env[option] === undefined || process.env[option] === null) {
      this._logger.critical('parseOption', `${option} does not exist as a environment variable`);
      result = undefined;
    }
    else if (process.env[option] === '') {
      this._logger.critical('parseOption', `no value for environment variable ${option} was provided`);
      result = undefined;
    }
    else {
      if (optionType === 'float') {
        result = parseFloat(process.env[option]);
        if (isNaN(result)) {
          this._logger.critical('parseOption', `unable to cast value of ${option} - ${process.env[option]} to float`);
          result = undefined;
        }
      }
      else if (optionType === 'int') {
        result = parseInt(process.env[option]);
        if (isNaN(result)) {
          this._logger.critical('parseOption', `unable to cast value of ${option} - ${process.env[option]} to int`);
          result = undefined;
        }
      }
      else if (optionType === 'string') {
        result = process.env[option];
      }
      else {
        this._logger.critical('parseOption', `unknown option type provided - ${optionType}`);
      }
    }
    return result;
  }
}

module.exports.Environment = Environment;