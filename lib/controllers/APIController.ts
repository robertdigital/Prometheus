import { AuthenticatedClient, ProductTicker, OrderParams, MarketOrder, LimitOrder, StopOrder } from "coinbase-pro"

const API_KEY: string = process.env.API_KEY ? process.env.API_KEY_TEST : '';
const API_SECRET: string = process.env.API_SECRET ? process.env.API_SECRET_TEST : '';
const PASS: string = process.env.PASS_PHRASE ? process.env.PASS_PHRASE_TEST : '';
const API_URI: string = process.env.API_URI ? process.env.API_URI : '';
const coinbaseProClient: AuthenticatedClient = new AuthenticatedClient(API_KEY, API_SECRET, PASS, API_URI);


/**
 * Controller to access the Coinbase PRO API (https://docs.pro.coinbase.com/)
 * Contains methods to simplify the client requests.
 * @export
 * @class APIController
 */
export class APIController {

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
    public getHistoricRatesByDay(range: number, currency: string): Promise<Array<Array<number>>> {
        let currentDate = new Date();
        let periodDate = new Date(new Date().setDate(currentDate.getDate() - range));
        return coinbaseProClient.getProductHistoricRates(currency, { start: periodDate.toISOString(), end: currentDate.toISOString(), granularity: 86400 });
    }

    public placeOrder(orderSide: string, type: string, stopOrder: boolean, ) {
        let order: OrderParams;
        if (type = "Market") {
            order = {
                type: "market",
                side: orderSide,
                product_id: "BTC-USD",
                size: "0.01"
            } as MarketOrder;
        } else {
            order = {
                type: "limit",
                side: "buy",
                product_id: "BTC-USD",
                price: "7100",
                size: "0.01"
            } as LimitOrder;
        }
        if (stopOrder) {
            order.stop
        }

        return coinbaseProClient.placeOrder(order);

    }

    public marketBuy(amount: string) {
        let order: OrderParams = {
            type: "market",
            side: "buy",
            product_id: "BTC-USD",
            funds: amount
        } as MarketOrder;
        return coinbaseProClient.placeOrder(order);
    }

    public marketSell(amount: string) {
        let order: OrderParams = {
            type: "market",
            side: "sell",
            product_id: "BTC-USD",
            size: amount
        } as MarketOrder;
        return coinbaseProClient.placeOrder(order);
    }


}
