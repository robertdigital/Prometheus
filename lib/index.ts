import { Handler, Context, Callback } from "aws-lambda";
import { DBController } from "./controllers/DBController";
import { Evaluator } from './workers/Evaluator';
import { APIController } from "./controllers/APIController";
import { Executor } from "./workers/Executor";
import { ProductTicker } from "coinbase-pro";
import { Db } from "mongodb";

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
    Promise.all([apiController.getTicker(currency),apiController.getOrderBook(currency),apiController.getHistoricRatesByDay(100,currency),dbController.connectToDatabase().then((db:Db)=>{ return dbController.getLastEvaluation(db)})]).then((res:any[])=>{
        if(!evaluator){
            evaluator = new Evaluator();
        }
        return evaluator.evaluatePrice(res[0],res[1],res[2],res[3][0]);
    }).then((evaluation)=>{
        return dbController.connectToDatabase().then((db:Db)=>{return dbController.storeEvaluation(db,evaluation)})
    }).then((evaluation)=>{
        callback(null,"all G");
    }).catch((e)=>{
        callback(e);
    })

}

export { handler };
