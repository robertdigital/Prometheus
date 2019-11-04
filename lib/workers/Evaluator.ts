import { TechnicalAnalyzer } from "../utilities/TAUtils";
import { ProductTicker, OrderParams, MarketOrder } from "coinbase-pro";
import { Evaluation, Indicators } from "../models/dataModels";


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
    public async evaluatePrice(ticker: ProductTicker, orderBook: Array<any>, historicalData: Array<number>, lastEval?: Evaluation) {
        console.info("Evaluating Price Data");
        let evaluation = new Evaluation();
        evaluation.price = parseFloat(ticker.price);
        console.info("Ticker : ", evaluation.price);
        console.log("History: ",historicalData);
        console.log("Slim History: ", historicalData);
        console.log("SMA 3: ", ta.sma(historicalData,3));
        console.info("SMA(50) : ", ta.sma(historicalData, 50));
        console.info("SMA(20) : ", ta.sma(historicalData, 20));
        let ema12 = ta.ema(historicalData, 12);
        console.log("ema12 full :",ema12);
        let ema26 = ta.ema(historicalData, 26);
        console.log("ema26 full :",ema26);
        console.info("EMA(12) : ", ema12[0]);
        console.info("EMA(26) : ", ema26[0]);
        let macd = ta.macd(historicalData, 20);
        let macdSignal = ta.macdSignal(macd);
        console.info("MACD : ", macd[0]);
        console.info("MACD Signal : ", macdSignal[0]);
        console.info("All MACDs : ", macd);
        console.info("All MACD Signlas : ", macdSignal);
        let rsi14 = ta.rsi(historicalData, 14);
        console.info("RSI(14) : ", rsi14);

        evaluation.indicators = (lastEval && lastEval.indicators) ? new Indicators(macd[0], macdSignal[0], lastEval.indicators) : new Indicators(macd[0], macdSignal[0]);

        

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
                let tenDollarsInBTC: string = (10/evaluation.price).toString();
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

}