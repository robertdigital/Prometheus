import {
    AuthenticatedClient,
    ProductTicker,
    OrderParams,
    Account
} from "coinbase-pro";

const API_KEY: string = process.env.API_KEY;
const API_SECRET: string = process.env.API_SECRET;
const PASS: string = process.env.PASS_PHRASE;
const API_URI: string = process.env.API_URI;
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
 * @class APIRepository
 */
export class APIRepository {
    /**
     * gets a ProductTicker object from the Coinbase Pro API which contains a security's current price
     *
     * @param {string} currency
     * @returns {Promise<ProductTicker>}
     * @memberof APIRepository
     */
    public getTicker(currency: string): Promise<ProductTicker> {
        return coinbaseProClient.getProductTicker(currency);
    }

    public getTickers(
        currencies: Array<string>
    ): Promise<Array<ProductTicker>> {
        let promises: Array<Promise<ProductTicker>> = [];
        for (let currency of currencies) {
            promises.push(coinbaseProClient.getProductTicker(currency));
        }
        return Promise.all(promises);
    }

    public getOrderBook(currency: string): Promise<any> {
        return coinbaseProClient.getProductOrderBook(currency, { level: 2 });
    }

    public getOrderBooks(currencies: Array<string>): Promise<Array<any>> {
        let promises: Array<Promise<any>> = [];
        for (let currency of currencies) {
            promises.push(
                coinbaseProClient.getProductOrderBook(currency, { level: 2 })
            );
        }
        return Promise.all(promises);
    }

    /**
     * gets the historical rate of a specified currency across a specified time period.
     *
     * @param {number} range days to go back
     * @param {string} currency the currency to get rates for. (BTC-USD,ETH-USD,etc.)
     * @returns PROMISE[ [ time, low, high, open, close, volume ], ...]
     * @memberof APIRepository
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

    public getMultipleHistoricClosingRatesByDay(
        range: number,
        currencies: Array<string>
    ): Promise<Array<Array<number>>> {
        let promises = [];
        for (let currency of currencies) {
            promises.push(this.getHistoricClosingRatesByDay(range, currency));
        }
        return Promise.all(promises);
    }

    /**
     * sends a order request to the Coinbase API
     *
     * @param {OrderParams} order an OrderParams object returned from the Evaluator inside the evaluation;
     * @memberof APIRepository
     */
    public executeOrder(order: OrderParams) {
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
     * @memberof APIRepository
     */
    public slimCoinbaseHistory(
        history: Array<Array<number>>,
        base: number
    ): Array<number> {
        let slimmedArray: Array<number> = [];
        for (let i = 0; i < history.length; i++) {
            slimmedArray.push(history[i][base]);
        }
        return slimmedArray;
    }

    public getAccounts(): Promise<Array<Account>> {
        return coinbaseProClient.getAccounts();
    }
}
