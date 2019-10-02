import { Handler, Context, Callback } from "aws-lambda";
import { DBController } from "./controllers/DBController";
import { Evaluator } from './workers/Evaluator';
import { APIController } from "./controllers/APIController";
import { Executor } from "./workers/Executor";
import { ProductTicker } from "coinbase-pro";

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

    let currency = "BTC-USD";
    Promise.all([apiController.getTicker(currency),apiController.getOrderBook(currency),apiController.getHistoricRatesByDay(100,currency)]).then((res:any[])=>{
        if(!evaluator){
            evaluator = new Evaluator();
        }
        return evaluator.evaluatePrice(res[0],res[1],res[2]);
    }).catch((e)=>{
        callback(e);
    })

}

export { handler };
