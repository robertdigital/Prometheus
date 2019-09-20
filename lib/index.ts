import { DataService } from "./services/DataService";
import { Handler, Context, Callback } from "aws-lambda";
import { cryptoPriceRequestJson } from "./models/coinbaseModels";
import { DBController } from "./services/DBController";
import { Db } from "mongodb";
import { PriceDataModel } from "./models/cryptoPriceDataModels";

let dbController: DBController | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let data = new DataService();
    if (!dbController) {
        dbController = new DBController();
    }
    data.getCurrentPrice().then((currentPriceString: string) => {
        let currentPriceJSON: cryptoPriceRequestJson = JSON.parse(currentPriceString);
        if (!dbController) {
            dbController = new DBController();
        }
        dbController.connectToDatabase().then(
            (db: Db) => dbController.savePriceData(db, new PriceDataModel(parseFloat(currentPriceJSON.data.amount))).then(
                (result: any) => {
                    callback(null, result);
                }).catch((err: any) => {
                    callback(err);
                })
        ).catch((err: any) => {
            callback(err);
        });
    });
}

export { handler };
