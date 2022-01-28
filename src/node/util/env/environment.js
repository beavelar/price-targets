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

  constructor(options) {
    this._parseOptions(options);
  }

  _parseOptions(options) {
    for (const key in options) {
      this._logger.debug('parseOptions', `parsing environment option ${key} of type ${options[key]}`);
      if (process.env[key] === undefined) {
        this._logger.critical('parseOptions', `${key} does not exist as a environment variable`);
        this.validKeys = false;
        break;
      }

      const validOption = this._parseOption(key, options[key]);
      if (!validOption) {
        this._logger.critical('parseOptions', 'unable to parse options provided');
        break;
      }
    }
  }

  _parseOption(option, optionType) {
    switch (optionType) {
      case 'float':
        try {
          const result = parseFloat(process.env[option]);
          this.values.set(option, result);
        }
        catch {
          this._logger.critical('parseOption', `unable to cast value of ${option} - ${process.env[option]} to float`);
          return false;
        }
        break;
      case 'int':
        try {
          const result = parseInt(process.env[option]);
          this.values.set(option, result);
        }
        catch {
          this._logger.critical('parseOption', `unable to cast value of ${option} - ${process.env[option]} to int`);
          return false;
        }
        break;
      case 'string':
        this.values.set(option, process.env[option]);
        break;
      default:
        this._logger.critical('parseOption', `unknown option type provided - ${optionType}`);
        return false;
    }
    return true;
  }
}

module.exports.Environment = Environment;