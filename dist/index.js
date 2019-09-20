"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataService_1 = require("./services/DataService");
const DBController_1 = require("./services/DBController");
const cryptoPriceDataModels_1 = require("./models/cryptoPriceDataModels");
let dbController = null;
const handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let data = new DataService_1.DataService();
    if (!dbController) {
        dbController = new DBController_1.DBController();
    }
    data.getCurrentPrice().then((currentPriceString) => {
        let currentPriceJSON = JSON.parse(currentPriceString);
        if (!dbController) {
            dbController = new DBController_1.DBController();
        }
        dbController.connectToDatabase().then((db) => dbController.savePriceData(db, new cryptoPriceDataModels_1.PriceDataModel(parseFloat(currentPriceJSON.data.amount))).then((result) => {
            callback(null, result);
        }).catch((err) => {
            callback(err);
        })).catch((err) => {
            callback(err);
        });
    });
};
exports.handler = handler;
//# sourceMappingURL=index.js.map