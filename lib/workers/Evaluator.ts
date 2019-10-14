import { TechnicalAnalyzer } from "../utilities/TAUtils";
import { ProductTicker } from "coinbase-pro";
import { MACDStatus, Evaluation } from "../models/dataModels";


let ta:TechnicalAnalyzer = new TechnicalAnalyzer();

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
    public async evaluatePrice(ticker: ProductTicker, orderBook: Array<any>, historicalData: Array<Array<number>>) {
        console.log("Evaluating Price Data");
        console.log("Ticker : ", ticker.price);
        console.log("SMA(50) : ", ta.sma(ta.slimHistory(historicalData,4),50));
        console.log("SMA(20) : ", ta.sma(ta.slimHistory(historicalData,4),20));
        console.log("EMA(12) : ", ta.ema(ta.slimHistory(historicalData,4),12)[0]);
        console.log("EMA(26) : ", ta.ema(ta.slimHistory(historicalData,4),26)[0]);
        let macd = ta.macd(historicalData,20);
        console.log("MACD : ",macd[0]);
        console.log("MACD Signal : ",ta.macdSignal(macd)[0]);
        return true;
    }

}