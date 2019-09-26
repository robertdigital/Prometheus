import { Handler, Context, Callback } from "aws-lambda";
import { DBController } from "./controllers/DBController";
import { PriceDataModel } from "./models/DatabaseModels";
import { Evaluator } from './workers/Evaluator';
import { APIController } from "./controllers/APIController";
import { Executor } from "workers/Executor";

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
    // 1. Get Price and Moving Average
    // - Store Price in DB
    // 2. Evaluate whether to buy
    // - Evaluator class gets passed api client
    // - makes needed calls and returns true or false if buy or not
    // - maybe also find how much to buy
    // 3. Execute the order
    // - Save transaction in DB
    Promise.all([dbController.connectToDatabase(), apiController.getBuyPrice()])
        .then((dbAndPrice: Array<any>) => {
            //Preliminary info needed
            return Promise.all([dbController.getMovingAverage(dbAndPrice[0]), dbController.savePriceData(dbAndPrice[0], new PriceDataModel(parseFloat(dbAndPrice[1].data.amount)))])
        })
        .then((movingAverageAndPrice: Array<any>) => {
            // Evaluator
            if (!evaluator) {
                evaluator = new Evaluator();
            }
            let price = movingAverageAndPrice[1];
            let movingAverage = movingAverageAndPrice[0];
            return evaluator.evaluatePrice(price, movingAverage);
        })
        .then((res) => {
            // Executor
            if (!executor){
                executor = new Executor();
            }
            return executor.executeOrder();
        })
        .then((res) => {
            callback(null, "True or false :: Sam is the coolest man in the world : " + res);
        })
        .catch((error) => {
            callback(error);
        })

}

export { handler };
