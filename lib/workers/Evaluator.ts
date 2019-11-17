import { TechnicalAnalyzer } from "../utilities/TAUtils";
import { ProductTicker, OrderParams, MarketOrder, Account } from "coinbase-pro";
import { Evaluation, Indicators, AccountState } from "../models/dataModels";

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
  public async evaluateConditions(
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

    let order: OrderParams = null;
    if (evaluation.indicators.macdCrossoverSignal) {
      if (evaluation.indicators.macdGTSignal) {
        order = {
          type: "market",
          side: "buy",
          funds: "10",
          product_id: "BTC-USD"
        } as MarketOrder;
      } else {
        // MIN btc = 0.00000001
        let tenDollarsInBTC: string = (10 / evaluation.price).toFixed(8);
        order = {
          type: "market",
          side: "sell",
          size: tenDollarsInBTC,
          product_id: "BTC-USD"
        } as MarketOrder;
      }
    }
    evaluation.order = order;
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
      if (account.currency == "BTC") {
        console.info("Account (" + account.currency + ") :");
        console.info(
          "balance - " + account.balance + "(" + account.currency + ")"
        );
        accountValue += parseFloat(
          (parseFloat(account.balance) * parseFloat(tick.price)).toFixed(8)
        );
        console.info(
          "balance in usd - " +
            parseFloat(account.balance) * parseFloat(tick.price)
        );
      } else if (account.currency == "USD") {
        console.info("Account (USD) :");
        accountValue += parseFloat(parseFloat(account.balance).toFixed(8));
        console.info(
          "balance - " + account.balance + "(" + account.currency + ")"
        );
      }
    }
    console.info("Total Account Value USD : " + accountValue.toFixed(2));
    return accountValue;
  }
}
