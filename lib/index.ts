import { Handler, Context, Callback } from "aws-lambda";
import { DBController } from "./controllers/DBController";
import { Db } from "mongodb";
import { PriceDataModel } from "./models/DatabaseModels";
import { Price, Client } from "coinbase";
import { Evaluator } from "workers/Evaluator";

const API_KEY: string = process.env.API_KEY ? process.env.API_KEY : '';
const API_SECRET: string = process.env.API_SECRET ? process.env.API_SECRET : '';

let dbController: DBController | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    let coinbaseClient: Client = new Client({ 'apiKey': API_KEY, 'apiSecret': API_SECRET });

    // STEPS
    // 1. Evaluate whether to buy
    // - Evaluator class gets passed api client
    // - makes needed calls and returns true or false if buy or not
    // - maybe also find how much to buy
    // 2. Execute the order

    coinbaseClient.getBuyPrice({ 'currencyPair': 'BTC-USD' }, (error: Error, priceObj: Price) => {
        if(priceObj){
            let price:number = parseFloat(priceObj.data.amount);
            // STORE PRICE IN DB
            if (!dbController) {
                dbController = new DBController();
            }
            dbController.connectToDatabase().then(
                (db: Db) => dbController.savePriceData(db, new PriceDataModel(price)).then(
                    (result: any) => {
                        callback(null, result);
                    }).catch((err: any) => {
                        callback(err);
                    })
            ).catch((err: any) => {
                callback(err);
            });

            let evaluator = new Evaluator();

            let priceEval = evaluator.evaluatePrice(price);

            


        } else if (error){

        } else {
            callback("Unknown error, no price or error retrieved from api");
        }
    });
}

export { handler };
