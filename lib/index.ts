import { Handler, Context, Callback } from "aws-lambda";
import { Db } from "mongodb";
import { DBRepository } from "./controllers/DBRepository";
import { APIRepository } from "./controllers/APIRepository";
import { Evaluator } from "./workers/Evaluator";
import { Executor } from "./workers/Executor";
import { Evaluation } from "./models/dataModels";
import { OrderResult, ProductTicker, Account } from "coinbase-pro";
import * as CONSTANTS from "./constants/constants";

let dbRepository: DBRepository | null = null;
let apiRepository: APIRepository | null = null;
let evaluator: Evaluator | null = null;
let executor: Executor | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!apiRepository) {
        apiRepository = new APIRepository();
    }
    if (!dbRepository) {
        dbRepository = new DBRepository();
    }

    // let currency = CONSTANTS.BTC_USD;
    let currencies = [CONSTANTS.BTC_USD];
    Promise.all([
        apiRepository.getTickers(currencies),
        apiRepository.getAccounts(),
        apiRepository.getOrderBooks(currencies),
        apiRepository.getMultipleHistoricClosingRatesByDay(100, currencies),
        dbRepository.connectToDatabase().then((db: Db) => {
            return dbRepository.getLastEvaluations(db, currencies);
        })
    ])
        .then(
            ([ticker, accounts, orderBook, historicRates, lastEvaluation]: [
                Array<ProductTicker>,
                Array<Account>,
                Array<Array<any>>,
                Array<Array<number>>,
                any
            ]) => {
                if (!evaluator) {
                    evaluator = new Evaluator();
                }
                return evaluator.multiEvaluation(
                    ticker,
                    accounts,
                    orderBook,
                    historicRates,
                    lastEvaluation
                );
                // return evaluator.evaluate(
                //     ticker,
                //     accounts,
                //     orderBook,
                //     historicRates,
                //     lastEvaluation[0]
                // );
            }
        )
        .then((evaluation: Array<Evaluation>) => {
            if (!executor) {
                executor = new Executor();
            }
            return executor.executeMultipleEvals(dbRepository, evaluation);
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
