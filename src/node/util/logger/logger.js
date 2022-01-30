/**
 * The available log levels that Logger can be configured for. Utilizing
 * a log level indicates only logs of the selected severity or higher
 * will be displayed. 
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  CRITICAL: 3
};

/**
 * The interface which will be responsible for the application logging
 */
class Logger {
  /** The filename of the file utilizing the logger */
  _filename = '';

  /** Log level which will control the severity of logs to display */
  _logLevel = LogLevel.DEBUG;

  /**
   * @param {string} filename The filename of the class utilizing the logger
   * @param {'DEBUG' | 'INFO' | 'WARNING' | 'CRITICAL' | undefined} logLevel The log level severity to display
   */
  constructor(filename, logLevel) {
    this._filename = filename;
    this._logLevel = this._getLogLevel(logLevel);
  }

  /**
   * Debug level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   * @returns {boolean} Indication of whether the log was display or not
   */
  debug(funcName, message) {
    if (this._logLevel <= LogLevel.DEBUG) {
      const date = this._formatDate(new Date());
      console.log(`DEBUG: ${date} - ${this._filename}.${funcName} - ${message}`);
      return true;
    }
    return false;
  }

  /**
   * Info level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   * @returns {boolean} Indication of whether the log was display or not
   */
  info(funcName, message) {
    if (this._logLevel <= LogLevel.INFO) {
      const date = this._formatDate(new Date());
      console.log(`INFO: ${date} - ${this._filename}.${funcName} - ${message}`);
      return true;
    }
    return false;
  }

  /**
   * Warning level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   * @param {Error?} error The error to display after the message
   * @returns {boolean} Indication of whether the log was display or not
   */
  warning(funcName, message, error) {
    if (this._logLevel <= LogLevel.WARNING) {
      const date = this._formatDate(new Date());
      console.log(`WARNING: ${date} - ${this._filename}.${funcName} - ${message}`);
      if (error) {
        console.error(error);
      }
      return true;
    }
    return false;
  }

  /**
   * Critical level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   * @param {Error?} error The error to display after the message
   * @returns {boolean} Indication of whether the log was display or not
   */
  critical(funcName, message, error) {
    if (this._logLevel <= LogLevel.CRITICAL) {
      const date = this._formatDate(new Date());
      console.error(`ERROR: ${date} - ${this._filename}.${funcName} - ${message}`);
      if (error) {
        console.error(error);
      }
      return true;
    }
    return false;
  }

  /**
   * Helper function to format the date displayed in the log line
   * 
   * @param {Date} date The date of the log
   * @returns {string} The date as a string in YYYY-MM-DD hh:mm:ss form
   */
  _formatDate(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1;
    const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate();
    const hour = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours();
    const minute = date.getUTCMinutes() < 10 ? `0${date.getUTCMinutes()}` : date.getUTCMinutes();
    const second = date.getUTCSeconds() < 10 ? `0${date.getUTCSeconds()}` : date.getUTCSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  /**
   * Helper function to retrieve the desired log level. We will first check
   * if the provided log level is a valid log level, if not, we will then
   * check if a log level was provided in process.env.LOG_LEVEL, if so,
   * check if valid, if it isn't valid, we will return a default of DEBUG
   * level.
   * 
   * @param {'DEBUG' | 'INFO' | 'WARNING' | 'CRITICAL' |
   * undefined} logLevel The log level to utilize as a string
   * @returns {LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING |
   * LogLevel.CRITICAL} The log level to utilize as a LogLevel
   */
  _getLogLevel(logLevel) {
    if (this._validLogLevel(logLevel)) {
      return LogLevel[logLevel];
    }
    else if (this._validLogLevel(process.env.LOG_LEVEL)) {
      return LogLevel[process.env.LOG_LEVEL];
    }
    else {
      return LogLevel.DEBUG;
    }
  }

  /**
   * Helper function to help determine if the provided log level is valid
   * or not. We only determine DEBUG, INFO, WARNING, and CRITICAL as valid
   * at the moment.
   * 
   * @param {string | undefined} logLevel The log level to verify 
   * @returns {boolean} Whether the provided log level is valid or not
   */
  _validLogLevel(logLevel) {
    switch (logLevel) {
      case 'DEBUG':
      case 'INFO':
      case 'WARNING':
      case 'CRITICAL':
        return true;
      default:
        return false;
    }
  }
}

module.exports.Logger = Logger;