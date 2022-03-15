import { Logger } from '../logger/logger';
import { EnvironmentOptions } from './env-options';

/**
 * Interface which will be responsible for containing the application environment variables.
 */
export class Environment {
  /** Flag indicating if consumed keys are valid */
  public validKeys = true;

  /** Logger for Environment */
  private logger = new Logger('env');

  /** Map which will contain the parse environment variables */
  private values = new Map();

  /**
   * @param options The provided options to attempt to parse and to parse to. The key should be
   * the environment variable to attempt to parse and the value should be the type to attempt to
   * parse to.
   */
  constructor(options: EnvironmentOptions) {
    this.values = this.parseOptions(options);
    if (this.values.size === 0) {
      this.validKeys = false;
    }
  }

  /**
   * Gets the desired environment variable from the _values map. If a fallback is provided, the
   * fallback will be utilized if the environment variable does not exist in the map. If the
   * environment variable doesn't exist and there is no fallback, a undefined will be returned.
   * 
   * @param option The environment variable to retrieve
   * @param fallback The fallback to utilize if environment variable doesn't exist
   * @returns The environment variable, fallback, or undefined
   */
  public get(option: string, fallback?: number | string): number | string | undefined {
    return this.values.get(option) ? this.values.get(option) : fallback;
  }

  /**
   * With the provided options, will attempt to retrieve the each desired environment variable
   * from the process environment and parse to the desired option type.
   * 
   * @param options The provided options to attempt to parse and to parse to. The key should be
   * the environment variable to attempt to parse and the value should be the type to attempt to
   * parse to.
   * @returns A map containing the result. If any of the options are unable to be parsed, the map
   * will be empty.
   */
  private parseOptions(options: EnvironmentOptions): Map<string, string> {
    const result = new Map();
    for (const key in options) {
      this.logger.debug('parseOptions', `parsing environment option ${key} of type ${options[key]}`);
      const parsedOption = this.parseOption(key, options[key]);
      result.set(key, parsedOption);

      if (parsedOption === undefined) {
        this.logger.critical('parseOptions', `unable to parse provided options`);
        return new Map();
      }
    }
    return result;
  }

  /**
   * With the provided option and optionType, will try to retrieve the environment variable from
   * the process environment and parse to the desired variable type.
   * 
   * @param option The environment variable to attempt to parse 
   * @param optionType What to attempt to parse the environment variable to. Valid options are 'float',
   * 'int', and 'string'
   * @returns The parsed option to the desired type or undefined if invalid
   */
  private parseOption(option: string, optionType: string): number | string | undefined {
    if (process.env[option]) {
      if (optionType === 'float') {
        const result = parseFloat(process.env[option] ?? '');
        if (isNaN(result)) {
          this.logger.critical('parseOption', `unable to cast value of ${option} - ${process.env[option]} to float`);
          return undefined;
        }
        return result;
      }
      else if (optionType === 'int') {
        const result = parseInt(process.env[option] ?? '');
        if (isNaN(result)) {
          this.logger.critical('parseOption', `unable to cast value of ${option} - ${process.env[option]} to int`);
          return undefined;
        }
        return result;
      }
      else if (optionType === 'string') {
        return process.env[option];
      }
      else {
        this.logger.critical('parseOption', `unknown option type provided - ${optionType}`);
      }
    }
    else {
      this.logger.critical('parseOption', `no value for environment variable ${option} was provided`);
      return undefined;
    }
  }
}