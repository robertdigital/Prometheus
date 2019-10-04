import { TechnicalAnalyzer } from "../utilities/TAUtils";
import { ProductTicker } from "coinbase-pro";
import { MACDStatus, Evaluation } from "../models/DatabaseModels";

export class Evaluator {

    private ta = new TechnicalAnalyzer();

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
    public async evaluatePrice(ticker: ProductTicker, orderBook: Array<any>, historicalData: Array<Array<number>>,lastEval:Evaluation) {
        // console.log("hello")
        let ema10 = this.ta.historicEMA({ values: historicalData, range: 10 });
        let ema20 = this.ta.historicEMA({ values: historicalData, range: 20 });
        let ema50 = this.ta.historicEMA({ values: historicalData, range: 50 });
        console.log("ema10: " + ema10[0] + " || ema20: " + ema20[0] + " || ema50: " + ema50[0]);

        let macd = this.ta.macd(historicalData,9);
        let signalLine = this.ta.macdSignal(macd);
        console.log("lastEval",lastEval);
        console.log("macDs",macd);
        console.log("CurrentMacD",macd[0])
        console.log("signalline",signalLine);
        console.log("CurrentSignal",signalLine[0])
        let evaluation = new Evaluation(macd,signalLine,lastEval);
        return evaluation;
    }

}