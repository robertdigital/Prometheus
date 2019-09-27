import { TechnicalAnalyzer } from "../utilities/TAUtils";

export class Evaluator {
    private ta = new TechnicalAnalyzer();
    public async evaluatePrice(historicalData:any){
        console.log("Currentprice according to hist : ",historicalData[0])
        let ema10 = this.ta.exponentialMovingAverage(historicalData,10);
        let ema20 = this.ta.exponentialMovingAverage(historicalData,20);
        let ema50 = this.ta.exponentialMovingAverage(historicalData,50);
        console.log("ema10: "+ ema10[0] + " || ema20: " + ema20[0] + " || ema50: "+ ema50[0]);
        return true;
    }

}