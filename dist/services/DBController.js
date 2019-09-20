"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI ? process.env.MONGODB_URI : '';
const DB_NAME = process.env.DB_NAME ? process.env.DB_NAME : '';
const PRICE_COLLECTION = process.env.PRICE_COLLECTION ? process.env.PRICE_COLLECTION : '';
class DBController {
    constructor() {
        this.cachedDb = null;
    }
    connectToDatabase() {
        if (this.cachedDb) {
            return Promise.resolve(this.cachedDb);
        }
        else {
            return mongodb_1.MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(Client => {
                this.cachedDb = Client.db(DB_NAME);
                return this.cachedDb;
            });
        }
    }
    savePriceData(db, data) {
        return db.collection(PRICE_COLLECTION).insertOne(data).then(() => {
            return { statusCode: 200, body: "Success" };
        }).catch(err => {
            return { statusCode: 500, body: "Error" };
        });
    }
}
exports.DBController = DBController;
//# sourceMappingURL=DBController.js.map