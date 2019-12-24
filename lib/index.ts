import { Handler, Context, Callback } from "aws-lambda";
import { Db } from "mongodb";
import { DBController } from "./controllers/DBController";
import { APIController } from "./controllers/APIController";
import { Evaluator } from "./workers/Evaluator";
import { Executor } from "./workers/Executor";
import { Evaluation } from "./models/dataModels";
import { OrderResult, ProductTicker, Account } from "coinbase-pro";
import * as CONSTANTS from "./constants/constants";

let dbController: DBController | null = null;
let apiController: APIController | null = null;
let evaluator: Evaluator | null = null;
let executor: Executor | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!apiController) {
        apiController = new APIController();
    }
    if (!dbController) {
        dbController = new DBController();
    }

    let currency = CONSTANTS.BTC_USD;
    Promise.all([
        apiController.getTicker(currency),
        apiController.getAccounts(),
        apiController.getOrderBook(currency),
        apiController.getHistoricClosingRatesByDay(100, currency),
        dbController.connectToDatabase().then((db: Db) => {
            return dbController.getLastEvaluation(db);
        })
    ])
        .then(
            ([ticker, accounts, orderBook, historicRates, dbConnection]: [
                ProductTicker,
                Array<Account>,
                Array<any>,
                Array<number>,
                any
            ]) => {
                if (!evaluator) {
                    evaluator = new Evaluator();
                }
                return evaluator.evaluate(
                    ticker,
                    accounts,
                    orderBook,
                    historicRates,
                    dbConnection[0]
                );
            }
        )
        .then((evaluation: Evaluation) => {
            if (!executor) {
                executor = new Executor();
            }
            return executor.executeEval(dbController, evaluation);
        })
        .then((placedOrders: Array<OrderResult>) => {
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
