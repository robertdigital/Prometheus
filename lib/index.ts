import { Handler, Context, Callback } from "aws-lambda";
import { Evaluator } from "./workers/Evaluator";
import { Executor } from "./workers/Executor";
import { Evaluation } from "./models/dataModels";
import { OrderResult, ProductTicker, Account } from "coinbase-pro";
import * as CONSTANTS from "./constants/constants";
import { DBService } from "./services/DBService";
import { APIService } from "./services/APIService";

let dbService: DBService | null = null;
let apiService: APIService | null = null;
let evaluator: Evaluator | null = null;
let executor: Executor | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!apiService) {
        apiService = new APIService();
    }
    if (!dbService) {
        dbService = new DBService();
    }

    // let currency = CONSTANTS.BTC_USD;
    let currencies = [CONSTANTS.BTC_USD];
    Promise.all([
        apiService.getTickers(currencies),
        apiService.getAccounts(),
        apiService.getOrderBooks(currencies),
        apiService.getHistoricClosingRatesByDayPerCurrency(100, currencies),
        dbService.getMostRecentEvaluations(currencies)
    ])
        .then(
            ([ticker, accounts, orderBook, historicRates, lastEvaluations]: [
                Array<ProductTicker>,
                Array<Account>,
                Array<Array<any>>,
                Array<Array<number>>,
                Array<Array<Evaluation>>
            ]) => {
                if (!evaluator) {
                    evaluator = new Evaluator();
                }
                return evaluator.multiEvaluation(
                    ticker,
                    accounts,
                    orderBook,
                    historicRates,
                    lastEvaluations
                );
            }
        )
        .then((evaluations: Array<Evaluation>) => {
            if (!executor) {
                executor = new Executor();
            }
            return executor.executeMultipleEvals(dbService, apiService, evaluations, currencies);
        })
        .then((placedOrders: Array<Array<OrderResult>>) => {
            if (placedOrders && placedOrders.length > 0) {
                callback(null, "ORDER(S) PLACED");
            } else {
                callback(null, "NO ORDER PLACED");
            }
        })
        .catch(e => {
            callback(e);
        });
};

export { handler };
