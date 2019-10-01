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

    apiController.getHistoricRatesByDay(10,'BTC-USD').then((res)=>{
        console.log("the data",res);
        callback(null,"done");
    });

}

export { handler };
