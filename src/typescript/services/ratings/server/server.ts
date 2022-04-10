import express from 'express';
import needle from 'needle';
import { Logger } from '../../../util/logger/logger';
import { Rating } from './rating';

/**
 * Wrapper for the rating server
 */
export class RatingsServer {
  /** The URL of the data provider */
  private dataUrl: string;

  /** Logger for RatingsServer */
  private logger: Logger;

  /** The express server instance */
  private server = express();

  constructor(dataUrl: string) {
    this.dataUrl = dataUrl;
    this.logger = new Logger('RatingsServer');

    /* istanbul ignore next */
    if (this.dataUrl) {
      this.initRatingsRoute();
    }
  }

  /**
   * Starts up the server to listen on the desired port.
   * 
   * @param port Port to listen on
   */
  /* istanbul ignore next */
  public init(port: string): void {
    this.server.listen(port, () => {
      this.logger.info('init', `server is up and listening on port: ${port}`);
    });
  }

  /**
   * Helper function to request data from the analyst data api.
   * 
   * @param ticker The ticker to request data for from the ticker service
   * @returns A promise which will resolve to the parsed data from the data retrieved or
   * reject with a string message
   */
  /* istanbul ignore next */
  private dataRequest(ticker: string): Promise<Rating> {
    return new Promise((resolve, reject) => {
      needle.get(`${this.dataUrl}/${ticker.toLowerCase()}/payload.json`, (err, res) => {
        if (err) {
          this.logger.critical('dataRequest', 'error occurred attempting to retrieve ratings', err);
          reject(new Error(`error occurred attempting to retrieve ratings: ${err}`));
        }
        else {
          this.logger.debug('dataRequest', `successfully retrieved ratings data for ${ticker}`);
          if (res.body.analysts && res.body.analysts.ratings) {
            resolve(this.getLowHighAverage(res.body.analysts.ratings));
          }
          else {
            this.logger.critical('dataRequest', 'no analyst ratings returned from analyst data request');
            reject(new Error('no analyst ratings returned from analyst data request'));
          }
        }
      });
    });
  }

  /**
   * Helper function to parse through the ratings and retrieve the highest and lowest rating,
   * as well as the average value of all the provided ratings.
   * 
   * @param ratings The provided ratings to parse
   * @returns An object containing the highest, lowest, and average value of ratings
   */
  private getLowHighAverage(ratings: Array<any>): Rating {
    this.logger.debug('getLowHighAverage', 'retrieving low, high, and average value of the ratings');
    let lowest;
    let highest;
    let total = 0;
    let count = 0;

    for (const rating of ratings) {
      if (rating.priceTarget && rating.priceTarget.value && rating.expert.avgReturn > 0) {
        if (lowest === undefined && highest === undefined) {
          lowest = rating.priceTarget.value;
          highest = rating.priceTarget.value;
        }
        else {
          if (rating.priceTarget.value < lowest)
            lowest = rating.priceTarget.value;
          if (rating.priceTarget.value > highest)
            highest = rating.priceTarget.value;
        }
        total += rating.priceTarget.value;
        count++;
      }
    }

    return {
      average: parseFloat((total / (count !== 0 ? count : 1)).toFixed(2)),
      highest,
      lowest
    };
  }

  /**
   * Creates the /ratings/:ticker route and add the logic to run whenever the route is reached.
   */
  /* istanbul ignore next */
  private initRatingsRoute() {
    this.server.get('/ratings/:ticker', (req, res) => {
      const ticker = req.params.ticker.toUpperCase();
      this.logger.debug('GET', `received GET request for ticker ${ticker}`);

      this.dataRequest(ticker.toLowerCase()).then((ratingData) => {
        this.logger.debug('GET', `responding with analyst ratings data for ${ticker}`);
        res.status(200).send(ratingData);
      }).catch((err) => {
        this.logger.warning('GET', err);
        res.status(500).send(err);
      });
    });
  }
}