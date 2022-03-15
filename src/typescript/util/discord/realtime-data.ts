/**
 * Response data from the realtime service.
 */
export type RealtimeData = {
  rating: {
    average: number;
    highest: number;
    lowest: number;
  },
  rating_history: {
    average: number;
    highest: number;
    lowest: number;
  },
  ticker: {
    companyName: string;
    price: number;
    symbol: string;
  }
}