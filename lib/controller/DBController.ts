import { Db, MongoClient } from "mongodb";
import { PriceDataModel } from "../models/cryptoPriceDataModels";

const MONGODB_URI: string = process.env.MONGODB_URI ? process.env.MONGODB_URI : '';
const DB_NAME: string = process.env.DB_NAME ? process.env.DB_NAME : ''; 
const PRICE_COLLECTION: string = process.env.PRICE_COLLECTION ? process.env.PRICE_COLLECTION : '';


export class DBController {
    public cachedDb: Db | null = null;

    public connectToDatabase(): Promise<Db>{
        if(this.cachedDb){
            return Promise.resolve(this.cachedDb);
        } else {
            return MongoClient.connect(MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true}).then(Client=>{
                this.cachedDb = Client.db(DB_NAME);
                return this.cachedDb;
            })
        }
    }

    public savePriceData(db:Db,data:PriceDataModel){
       return db.collection(PRICE_COLLECTION).insertOne(data).then(()=>{
           return { statusCode: 200, body: "Success"};
       }).catch(err=>{
           return { statusCode: 500, body:"Error"};
       });
    }
}