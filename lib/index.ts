import { Handler, Context, Callback } from "aws-lambda";
import { DBController } from "./controllers/DBController";
import { PriceDataModel } from "./models/DatabaseModels";
import { Evaluator } from './workers/Evaluator';
import { APIController } from "./controllers/APIController";
import { Executor } from "./workers/Executor";

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

    // STEPS
    // 1. Get Price
    // - Store Price in DB
    // - retrieve historical data
    // 2. Using current price and historical data, evaluate whether to buy
    // - Runs technical analysis formulas to determine whether to buy
    // - maybe also find how much to buy
    // 3. Execute the order
    // - Save transaction in DB

    Promise.all([dbController.connectToDatabase(), apiController.getBuyPrice()])
        .then((dbAndPrice: Array<any>) => {
            //Preliminary info needed 
            return dbController.savePriceData(dbAndPrice[0], new PriceDataModel(parseFloat(dbAndPrice[1].data.amount))).then((price) => {
                return dbController.getHistoricalData(dbAndPrice[0],250);
            })
        })
        .then((historicalData: Array<number>) => {
            // Evaluator
            if (!evaluator) {
                evaluator = new Evaluator();
            }
            return evaluator.evaluatePrice(historicalData);
        })
        .then((res) => {
            // Executor
            if (!executor) {
                executor = new Executor();
            }
            return executor.executeDecision();
        })
        .then((res) => {
            callback(null, "True or false :: Sam is the coolest man in the world : " + res);
        })
        .catch((error) => {
            callback(error);
        })

}

export { handler };
