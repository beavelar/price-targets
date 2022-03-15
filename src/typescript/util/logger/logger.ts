import { LogLevel } from "./level";

/**
 * The interface which will be responsible for the application logging
 */
export class Logger {
  /** The filename of the file utilizing the logger */
  private filename: string;

  /** Log level which will control the severity of logs to display */
  private logLevel: LogLevel;

  /**
   * @param filename The filename of the class utilizing the logger
   * @param logLevel The log level severity to display
   */
  constructor(filename: string, logLevel: LogLevel = LogLevel.DEBUG) {
    this.filename = filename;
    this.logLevel = logLevel;
  }

  /**
   * Debug level log implementation.
   * 
   * @param funcName The name of the function utilizing the method 
   * @param message The desired message to log
   * @returns Indication of whether the log was display or not
   */
  public debug(funcName: string, message: string): boolean {
    if (this.logLevel <= LogLevel.DEBUG) {
      const date = this.formatDate(new Date());
      console.debug(`DEBUG: ${date} - ${this.filename}.${funcName} - ${message}`);
      return true;
    }
    return false;
  }

  /**
   * Info level log implementation.
   * 
   * @param funcName The name of the function utilizing the method 
   * @param message The desired message to log
   * @returns Indication of whether the log was display or not
   */
  public info(funcName: string, message: string): boolean {
    if (this.logLevel <= LogLevel.INFO) {
      const date = this.formatDate(new Date());
      console.log(`INFO: ${date} - ${this.filename}.${funcName} - ${message}`);
      return true;
    }
    return false;
  }

  /**
   * Warning level log implementation.
   * 
   * @param funcName The name of the function utilizing the method 
   * @param message The desired message to log
   * @param error The error to display after the message
   * @returns Indication of whether the log was display or not
   */
  public warning(funcName: string, message: string, error?: Error): boolean {
    if (this.logLevel <= LogLevel.WARNING) {
      const date = this.formatDate(new Date());
      console.warn(`WARNING: ${date} - ${this.filename}.${funcName} - ${message}`);
      if (error) {
        console.warn(error);
      }
      return true;
    }
    return false;
  }

  /**
   * Critical level log implementation.
   * 
   * @param funcName The name of the function utilizing the method 
   * @param message The desired message to log
   * @param error The error to display after the message
   * @returns Indication of whether the log was display or not
   */
  public critical(funcName: string, message: string, error?: Error): boolean {
    if (this.logLevel <= LogLevel.CRITICAL) {
      const date = this.formatDate(new Date());
      console.error(`ERROR: ${date} - ${this.filename}.${funcName} - ${message}`);
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
   * @param date The date of the log
   * @returns The date as a string in YYYY-MM-DD hh:mm:ss form
   */
  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1;
    const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate();
    const hour = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours();
    const minute = date.getUTCMinutes() < 10 ? `0${date.getUTCMinutes()}` : date.getUTCMinutes();
    const second = date.getUTCSeconds() < 10 ? `0${date.getUTCSeconds()}` : date.getUTCSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}