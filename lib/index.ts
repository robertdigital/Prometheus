import { Handler, Context, Callback } from "aws-lambda";
import { DBController } from "./controllers/DBController";
import { Db } from "mongodb";
import { PriceDataModel } from "./models/DatabaseModels";
import { Price, Client } from "coinbase";
import { Evaluator } from './workers/Evaluator';
import { APIController } from "./controllers/APIController";

const API_KEY: string = process.env.API_KEY ? process.env.API_KEY : '';
const API_SECRET: string = process.env.API_SECRET ? process.env.API_SECRET : '';

let dbController: DBController | null = null;
let apiController: APIController | null = null;
let evaluator : Evaluator | null = null;
const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!apiController) {
        apiController = new APIController();
    }
    if (!dbController) {
        dbController = new DBController();
    }


    Promise.all([dbController.connectToDatabase(), apiController.getBuyPrice()])
        .then((res) => {
            //Preliminary info needed
            return Promise.all([dbController.getMovingAverage(res[0]), dbController.savePriceData(res[0], new PriceDataModel(parseFloat(res[1].data.amount)))])
        })
        .then((res) => {
            // Evaluator
            if(!evaluator){
                evaluator = new Evaluator();
            }
            let price = res[1];
            let movingAverage = res[0];
            return evaluator.evaluatePrice(price,movingAverage);
        })
        .then((res)=>{
            // Executor
            return res
        })
        .then((res)=>{
            callback(null,"True or false :: Sam is the coolest man in the world : "+res);
        })
        .catch((error)=>{
            callback(error);
        })

    // STEPS
    // 1. Evaluate whether to buy
    // - Evaluator class gets passed api client
    // - makes needed calls and returns true or false if buy or not
    // - maybe also find how much to buy
    // 2. Execute the order

    // coinbaseClient.getBuyPrice({ 'currencyPair': 'BTC-USD' }, (error: Error, priceObj: Price) => {
    //     if(priceObj){
    //         let price:number = parseFloat(priceObj.data.amount);
    //         // STORE PRICE IN DB
    //         if (!dbController) {
    //             dbController = new DBController();
    //         }
    //         dbController.connectToDatabase().then(
    //             (db: Db) => 
    //             {
    //                 dbController.savePriceData(db, new PriceDataModel(price)).then(
    //                 (result: any) => {
    //                     console.log(result);
    //                 }).catch((err: any) => {
    //                     console.error(err);
    //                 });
    //                 let y = dbController.getMovingAverage(db);
    //                 console.log("MOVING AVERAGE",dbController.getMovingAverage(db));
    //                 callback(null,"Works???");
    //             }
    //         ).catch((err: any) => {
    //             console.error(err);
    //         });

    //         let evaluator = new Evaluator();

    //         let priceEval = evaluator.evaluatePrice(price);


    //     } else if (error){

    //     } else {
    //         callback("Unknown error, no price or error retrieved from api");
    //     }
    // });
}

export { handler };
