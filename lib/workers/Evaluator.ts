import { TechnicalAnalyzer } from "../utilities/TAUtils";
import {
    ProductTicker,
    OrderParams,
    MarketOrder,
    Account,
    LimitOrder,
} from "coinbase-pro";
import { Evaluation, Indicators, AccountState } from "../models/dataModels";
import * as CONSTANTS from "../constants/constants";

let ta: TechnicalAnalyzer = new TechnicalAnalyzer();

export class Evaluator {
    /**
     * Main method of the evaluator.
     *  Full parameters not yet final. WIll take any necessary info
     *  must take that info and make a decision whether or not to buy.
     *  This decision may be preseted as a "decision" object that will comntain info
     *  on whether to buy, sell  or do nothing, as well as how much to buy and sell in those cases.
     *
     * @param {*} historicalData
     * @returns
     * @memberof Evaluator
     */
    public async evaluate(
        ticker: ProductTicker,
        accounts: Array<Account>,
        orderBook: Array<any>,
        historicalData: Array<number>,
        lastEval?: Evaluation
    ) {
        console.info("--- Evaluating Present Conditions ---");
        let evaluation = new Evaluation();
        evaluation.accountState = new AccountState(
            this.accountValue(accounts, ticker),
            accounts
        );
        evaluation.price = parseFloat(ticker.price);
        console.info("Ticker : ", evaluation.price);
        console.info("SMA(50) : ", ta.sma(historicalData, 50));
        console.info("SMA(20) : ", ta.sma(historicalData, 20));
        let ema12 = ta.ema(historicalData, 12);
        let ema26 = ta.ema(historicalData, 26);
        console.info("EMA(12) : ", ema12[0]);
        console.info("EMA(26) : ", ema26[0]);
        let macd = ta.macd(historicalData, 20);
        let macdSignal = ta.macdSignal(macd);
        console.info("MACD : ", macd[0]);
        console.info("MACD Signal : ", macdSignal[0]);
        let rsi14 = ta.rsi(historicalData, 14);
        console.info("RSI(14) : ", rsi14);

        evaluation.indicators =
            lastEval && lastEval.indicators
                ? new Indicators(macd[0], macdSignal[0], lastEval.indicators)
                : new Indicators(macd[0], macdSignal[0]);

        evaluation.orders = this.determineOrder(
            ticker,
            evaluation.indicators,
            accounts,
            evaluation.accountState
        );

        return evaluation;
    }

    /**
     * private function to get a quick valuation of all the accounts associated with the user.
     * @private
     * @param {Array<Account>} acnts
     * @param {ProductTicker} tick
     * @returns {number}
     * @memberof Evaluator
     */
    private accountValue(acnts: Array<Account>, tick: ProductTicker): number {
        console.info("-- Evaluating Account Info --");
        console.info("Accounts : ", acnts);
        let accountValue: number = 0;
        for (let account of acnts) {
            if (account.currency == CONSTANTS.BTC) {
                console.info("Account (" + account.currency + ") :");
                console.info(
                    " >balance - " +
                    account.balance +
                    "(" +
                    account.currency +
                    ")"
                );
                accountValue += parseFloat(
                    (
                        parseFloat(account.balance) * parseFloat(tick.price)
                    ).toFixed(8)
                );
                console.info(
                    " >balance in usd - " +
                    parseFloat(account.balance) * parseFloat(tick.price)
                );
            } else if (account.currency == CONSTANTS.USD) {
                console.info("Account (USD) :");
                accountValue += parseFloat(
                    parseFloat(account.balance).toFixed(8)
                );
                console.info(
                    " >balance - " +
                    account.balance +
                    "(" +
                    account.currency +
                    ")"
                );
            }
        }
        console.info("Total Account Value USD : " + accountValue.toFixed(2));
        return accountValue;
    }

    /**
     * Calculates the size of an order to place.
     *
     * @private
     * @param {number} accountValue
     * @param {Array<Account>} accounts
     * @param {String} currency
     * @param {ProductTicker} ticker
     * @returns {String}
     * @memberof Evaluator
     */
    private calculateOrderSize(
        accountValue: number,
        accounts: Array<Account>,
        currency: String,
        ticker: ProductTicker
    ): string {
        let riskAmount: number = CONSTANTS.RISK_PERCENT * accountValue;
        let orderSize: string;
        let maxOrderSize =
            (riskAmount * CONSTANTS.REWARD_RISK_RATIO) /
            CONSTANTS.EXPECTABLE_CHANGE;
        for (let account of accounts) {
            if (account.currency == currency) {
                if (currency == CONSTANTS.USD) {
                    if (maxOrderSize > parseFloat(account.balance)) {
                        orderSize = parseFloat(account.balance).toFixed(
                            CONSTANTS.USD_PRECISION
                        );
                    } else {
                        orderSize = maxOrderSize.toFixed(
                            CONSTANTS.USD_PRECISION
                        );
                    }
                } else {
                    if (
                        maxOrderSize / parseFloat(ticker.price) >
                        parseFloat(account.balance)
                    ) {
                        orderSize = parseFloat(account.balance).toFixed(
                            CONSTANTS.BTC_PRECISION
                        );
                    } else {
                        orderSize = (
                            maxOrderSize / parseFloat(ticker.price)
                        ).toFixed(CONSTANTS.BTC_PRECISION);
                    }
                }
            }
        }

        return orderSize;
    }

    /**
     * Calculates where to place stop loss limit order price point.
     * expectable change is a percent based on observation, how much we might expect the bitcoin price to move.
     * The expectable change is an observation of growth, and helps determine the order size.
     * following that ordersize is crafted by deviding the ideal reward for the trade(2x the risk) by the percent we expect the price to change by
     * we know that to prevent more than the risk amount we place the limit price at half the expectable change
     *
     * @private
     * @param {ProductTicker} ticker
     * @returns {string}
     * @memberof Evaluator
     */
    private calculateStopLossLimitOrderPricePoint(
        ticker: ProductTicker
    ): string {
        return (
            parseFloat(ticker.price) -
            parseFloat(ticker.price) *
            (CONSTANTS.EXPECTABLE_CHANGE / CONSTANTS.REWARD_RISK_RATIO)
        ).toFixed(CONSTANTS.USD_PRECISION);
    }

    /**
     *
     *
     * @private
     * @param {ProductTicker} ticker
     * @param {Indicators} indicators
     * @param {Array<Account>} accounts
     * @param {AccountState} accountState
     * @returns {Array<OrderParams>} Array of orders. empty array if no order to be placed.
     * @memberof Evaluator
     */
    private determineOrder(
        ticker: ProductTicker,
        indicators: Indicators,
        accounts: Array<Account>,
        accountState: AccountState
    ): Array<OrderParams> {
        let orders: Array<OrderParams> = [];
        if (indicators.macdCrossoverSignal) {
            if (indicators.macdGTSignal) {
                let orderSize = this.calculateOrderSize(
                    accountState.totalValue,
                    accounts,
                    CONSTANTS.USD,
                    ticker
                );
                let orderSizeNumber = parseFloat(orderSize);
                let limitOrderSize = (
                    orderSizeNumber / parseFloat(ticker.price)
                ).toFixed(CONSTANTS.BTC_PRECISION);
                let marketOrder = {
                    type: "market",
                    side: "buy",
                    funds: orderSize,
                    product_id: CONSTANTS.BTC_USD
                } as MarketOrder;
                let stopLossLimitOrder = {
                    type: "limit",
                    funds: orderSize,
                    side: "sell",
                    price: this.calculateStopLossLimitOrderPricePoint(ticker),
                    stop_price: this.calculateStopLossLimitOrderPricePoint(
                        ticker
                    ),
                    size: limitOrderSize,
                    product_id: CONSTANTS.BTC_USD,
                    stop: "loss"
                } as LimitOrder;
                if (
                    parseFloat(orderSize) > CONSTANTS.USD_MINIMUM &&
                    orderSizeNumber < CONSTANTS.USD_MAXIMUM
                ) {
                    orders.push(marketOrder);
                    orders.push(stopLossLimitOrder);
                }
            } else {
                // MIN btc = 0.00000001
                let orderSize = this.calculateOrderSize(
                    accountState.totalValue,
                    accounts,
                    CONSTANTS.BTC,
                    ticker
                );
                let orderSizeNumber = parseFloat(orderSize);
                let sellOrder = {
                    type: "market",
                    side: "sell",
                    size: orderSize,
                    product_id: CONSTANTS.BTC_USD
                } as MarketOrder;
                if (
                    parseFloat(orderSize) > CONSTANTS.BTC_MINIMUM &&
                    orderSizeNumber < CONSTANTS.BTC_MAXIMUM
                ) {
                    orders.push(sellOrder);
                }
            }
        }
        return orders;
    }
}
