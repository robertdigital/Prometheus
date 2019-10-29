import { TechnicalAnalyzer } from "../utilities/TAUtils";
import { ProductTicker, OrderParams } from "coinbase-pro";
import { MACDStatus, Evaluation } from "../models/dataModels";


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
    public async evaluatePrice(ticker: ProductTicker, orderBook: Array<any>, historicalData: Array<Array<number>>, lastEval: Evaluation) {
        console.log("Evaluating Price Data");
        let price = parseFloat(ticker.price);
        let slimHistory = ta.slimHistory(historicalData, 4);
        console.log("Ticker : ", price);
        console.log("SMA(50) : ", ta.sma(slimHistory, 50));
        console.log("SMA(20) : ", ta.sma(slimHistory, 20));
        let ema12 = ta.ema(ta.slimHistory(historicalData, 4), 12)[0];
        let ema26 = ta.ema(ta.slimHistory(historicalData, 4), 26)[0];
        console.log("EMA(12) : ", ema12);
        console.log("EMA(26) : ", ema26);
        let macd = ta.macd(historicalData, 20);
        let macdSignal = ta.macdSignal(macd);
        console.log("MACD : ", macd[0]);
        console.log("MACD Signal : ", macdSignal[0]);
        let rsi14 = ta.rsi(slimHistory, 14);
        console.log("RSI(14) : ", rsi14);

        let order:OrderParams = null;

        return new Evaluation(price, macd[0], macdSignal[0], rsi14, order ,lastEval);
    }

}