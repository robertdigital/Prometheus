import { AuthenticatedClient, ProductTicker, OrderParams } from "coinbase-pro";
import * as https from "https";

const API_KEY: string = process.env.TEST
  ? process.env.API_KEY_TEST
  : process.env.API_KEY;
const API_SECRET: string = process.env.TEST
  ? process.env.API_SECRET_TEST
  : process.env.API_SECRET;
const PASS: string = process.env.TEST
  ? process.env.PASS_PHRASE_TEST
  : process.env.PASS_PHRASE;
const API_URI: string = process.env.TEST
  ? process.env.API_URI_TEST
  : process.env.API_URI;
const coinbaseProClient: AuthenticatedClient = new AuthenticatedClient(
  API_KEY,
  API_SECRET,
  PASS,
  API_URI
);

/**
 * Controller to access the Coinbase PRO API (https://docs.pro.coinbase.com/)
 * Contains methods to simplify the client requests and add logging.
 *
 * @export
 * @class APIController
 */
export class APIController {
  /**
   * gets a ProductTicker object from the Coinbase Pro API which contains a security's current price
   *
   * @param {string} currency
   * @returns {Promise<ProductTicker>}
   * @memberof APIController
   */
  public getTicker(currency: string): Promise<ProductTicker> {
    return coinbaseProClient.getProductTicker(currency);
  }

  public getOrderBook(currency: string): Promise<any> {
    return coinbaseProClient.getProductOrderBook(currency, { level: 2 });
  }

  /**
   * gets the historical rate of a specified currency across a specified time period.
   *
   * @param {number} range days to go back
   * @param {string} currency the currency to get rates for. (BTC-USD,ETH-USD,etc.)
   * @returns PROMISE[ [ time, low, high, open, close, volume ], ...]
   * @memberof APIController
   */
  public getHistoricClosingRatesByDay(
    range: number,
    currency: string
  ): Promise<Array<number>> {
    let currentDate = new Date();
    let periodDate = new Date(
      new Date().setDate(currentDate.getDate() - range)
    );
    return coinbaseProClient
      .getProductHistoricRates(currency, {
        start: periodDate.toISOString(),
        end: currentDate.toISOString(),
        granularity: 86400
      })
      .then((data: Array<Array<number>>) => {
        console.log(data);
        return this.slimCoinbaseHistory(data, 4);
      });
  }

  /**
   * sends a order request to the Coinbase API
   *
   * @param {OrderParams} order an OrderParams object returned from the Evaluator inside the evaluation;
   * @memberof APIController
   */
  public executeOrder(order: OrderParams) {
    console.info("Executing order: ", order);
    return coinbaseProClient.placeOrder(order);
  }

  /**
   * Slims down historic data provided by coinbase. The base indicates which value to get.
   * 1 - High,
   * 2 - Low,
   * 3 - Open,
   * 4 - Close,
   * DEFAULT - 4 (Close)
   *
   * @param {Array<Array<number>>} history
   * @param {number} base
   * @returns
   * @memberof APIController
   */
  public slimCoinbaseHistory(history: Array<Array<number>>, base: number) {
    let slimmedArray: Array<number> = [];
    for (let i = 0; i < history.length; i++) {
      slimmedArray.push(history[i][base]);
    }
    return slimmedArray;
  }

  public getAccounts() {
    return coinbaseProClient.getAccounts();
  }
}
