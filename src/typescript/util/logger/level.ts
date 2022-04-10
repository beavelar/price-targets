/**
 * The available log levels that Logger can be configured for. Utilizing a log level indicates
 * only logs of the selected severity or higher will be displayed. Setting to TESTING indicates
 * no logs will be displayed. Should be utilized for testing purposes only.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  CRITICAL = 3,
  TESTING = 4
};