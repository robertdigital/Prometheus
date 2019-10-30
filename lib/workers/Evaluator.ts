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
    public async evaluatePrice(ticker: ProductTicker, orderBook: Array<any>, historicalData: Array<Array<number>>, lastEval?: Evaluation) {
        console.info("Evaluating Price Data");
        let evaluation = new Evaluation();
        evaluation.price = parseFloat(ticker.price);
        console.info("Ticker : ", evaluation.price);
        // let slimHistory = ta.slimHistory(historicalData, 4);
        // console.info("SMA(50) : ", ta.sma(slimHistory, 50));
        // console.info("SMA(20) : ", ta.sma(slimHistory, 20));
        // let ema12 = ta.ema(ta.slimHistory(historicalData, 4), 12)[0];
        // let ema26 = ta.ema(ta.slimHistory(historicalData, 4), 26)[0];
        // console.info("EMA(12) : ", ema12);
        // console.info("EMA(26) : ", ema26);
        let macd = ta.macd(historicalData, 20);
        let macdSignal = ta.macdSignal(macd);
        console.info("MACD : ", macd[0]);
        console.info("MACD Signal : ", macdSignal[0]);
        // let rsi14 = ta.rsi(slimHistory, 14);
        // console.info("RSI(14) : ", rsi14);

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