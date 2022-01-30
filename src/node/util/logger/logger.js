/**
 * The interface which will be responsible for the application logging
 */
class Logger {
  /** The filename of the file utilizing the logger */
  _filename = '';

  /**
   * @param {string} filename The filename of the class utilizing the logger
   */
  constructor(filename) {
    this._filename = filename;
  }

  /**
   * Debug level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   */
  debug(funcName, message) {
    const date = this._formatDate(new Date());
    console.log(`DEBUG: ${date} - ${this._filename}.${funcName} - ${message}`);
  }

  /**
   * Info level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   */
  info(funcName, message) {
    const date = this._formatDate(new Date());
    console.log(`INFO: ${date} - ${this._filename}.${funcName} - ${message}`);
  }

  /**
   * Warning level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   * @param {Error?} error The error to display after the message
   */
  warning(funcName, message, error) {
    const date = this._formatDate(new Date());
    console.log(`WARNING: ${date} - ${this._filename}.${funcName} - ${message}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Critical level log implementation.
   * 
   * @param {string} funcName The name of the function utilizing the method 
   * @param {string} message The desired message to log
   * @param {Error?} error The error to display after the message
   */
  critical(funcName, message, error) {
    const date = this._formatDate(new Date());
    console.error(`ERROR: ${date} - ${this._filename}.${funcName} - ${message}`);
    if (error) {
      console.error(error);
    }
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
}

module.exports.Logger = Logger;