import { Handler, Context, Callback } from "aws-lambda";
import { Db } from "mongodb";
import { DBController } from "./controllers/DBController";
import { APIRepository } from "./controllers/APIRepository";
import { Evaluator } from "./workers/Evaluator";
import { Executor } from "./workers/Executor";
import { Evaluation } from "./models/dataModels";
import { OrderResult, ProductTicker, Account } from "coinbase-pro";
import * as CONSTANTS from "./constants/constants";

let dbController: DBController | null = null;
let apiController: APIRepository | null = null;
let evaluator: Evaluator | null = null;
let executor: Executor | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!apiController) {
        apiController = new APIRepository();
    }
    if (!dbController) {
        dbController = new DBController();
    }

    // let currency = CONSTANTS.BTC_USD;
    let currencies = [CONSTANTS.BTC_USD];
    Promise.all([
        apiController.getTickers(currencies),
        apiController.getAccounts(),
        apiController.getOrderBooks(currencies),
        apiController.getMultipleHistoricClosingRatesByDay(100, currencies),
        dbController.connectToDatabase().then((db: Db) => {
            return dbController.getLastEvaluations(db, currencies);
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
            return executor.executeMultipleEvals(dbController, evaluation);
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
