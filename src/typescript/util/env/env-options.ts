/**
 * The environment variable options to parse the environment variable to.
 */
export interface EnvironmentOptions {
  [key: string]: 'float' | 'int' | 'string';
}