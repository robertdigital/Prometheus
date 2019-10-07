import { Db, MongoClient } from "mongodb";
import { MACDStatus } from "../models/DatabaseModels";

const MONGODB_URI: string = process.env.MONGODB_URI ? process.env.MONGODB_URI : '';
const DB_NAME: string = process.env.DB_NAME ? process.env.DB_NAME : '';
const PRICE_COLLECTION: string = process.env.PRICE_COLLECTION ? process.env.PRICE_COLLECTION : '';


export class DBController {
    private cachedDb: Db | null = null;

    public connectToDatabase(): Promise<Db> {
        if (this.cachedDb) {
            console.info("***Using cached DB***")
            return Promise.resolve(this.cachedDb);
        } else {
            console.info("***Creating new DB connection instance***")
            return MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(Client => {
                this.cachedDb = Client.db(DB_NAME);
                return this.cachedDb;
            })
        }
    }

    public storeEvaluation(db: Db, data: any) {
        return db.collection(PRICE_COLLECTION).insertOne(data).then(() => { return "great" }).catch(() => { return ":(" });
    }

    public getLastEvaluation(db: Db) {
        return db.collection(PRICE_COLLECTION).find({}).limit(1).sort({ $natural: -1 }).toArray();
    }

    // public savePriceData(db: Db, data: IndDirection) {
    //     return db.collection(PRICE_COLLECTION).insertOne(data).then(() => {
    //         console.info("***Saved data to database successfully***")
    //         return data.price;
    //     }).catch(err => {
    //         console.error("-XXXXX- ERROR: FAILED TO STORE IN DATABASE -XXXXX-")
    //         return 0;
    //     });
    // }

    // /**
    //  * Gets historical data stored in db.
    //  *
    //  * @param {Db} db
    //  * @param {number} range
    //  * @param {number} [timeMarker]
    //  * @returns {Promise<Array<number>>}
    //  * @memberof DBController
    //  */
    // public async getHistoricalData(db: Db, range: number, timeMarker?: number):Promise<Array<number>> {
    //     let findArgs = {};
    //     if (timeMarker) {
    //         findArgs = { timeMark: 1 };
    //     }
    //     let x = await db.collection(PRICE_COLLECTION).find(findArgs).sort({ $natural: -1 }).limit(range).toArray();
    //     let priceArray: Array<number> = [];
    //     x.forEach((document: PriceDataModel) => {
    //         priceArray.push(document.price);
    //     });
    //     return priceArray;
    // }
}