import { TechnicalAnalyzer } from "../utilities/TAUtils";

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
    public async evaluatePrice(historicalData: any) {

        console.log(historicalData[0]);
        let ema10 = this.ta.exponentialMovingAverage(historicalData, 10);
        let ema20 = this.ta.exponentialMovingAverage(historicalData, 20);
        let ema50 = this.ta.exponentialMovingAverage(historicalData, 50);
        console.log("ema10: " + ema10[0] + " || ema20: " + ema20[0] + " || ema50: " + ema50[0]);
        return true;

    }

}