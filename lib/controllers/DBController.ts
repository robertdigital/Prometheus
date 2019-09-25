import { Db, MongoClient } from "mongodb";
import { PriceDataModel } from "../models/DatabaseModels";

const MONGODB_URI: string = process.env.MONGODB_URI ? process.env.MONGODB_URI : '';
const DB_NAME: string = process.env.DB_NAME ? process.env.DB_NAME : ''; 
const PRICE_COLLECTION: string = process.env.PRICE_COLLECTION ? process.env.PRICE_COLLECTION : '';


export class DBController {
    public cachedDb: Db | null = null;

    public connectToDatabase(): Promise<Db>{
        if(this.cachedDb){
            console.info("***Using cached DB***")
            return Promise.resolve(this.cachedDb);
        } else {
            console.info("***Creating new DB connection instance***")
            return MongoClient.connect(MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true}).then(Client=>{
                this.cachedDb = Client.db(DB_NAME);
                return this.cachedDb;
            })
        }
    }

    public savePriceData(db:Db,data:PriceDataModel){
       return db.collection(PRICE_COLLECTION).insertOne(data).then(()=>{
           console.info("***Saved data to database successfully***")
           return data.price;
       }).catch(err=>{
           console.error("-XXXXX- ERROR: FAILED TO STORE IN DATABASE -XXXXX-")
           return 0;
       });
    }

    public async getMovingAverage(db:Db){
        let x = await db.collection(PRICE_COLLECTION).find().sort({$natural : -1}).limit(20).toArray();
        let average = 0;
        x.forEach((document:PriceDataModel)=>{
            average += document.price;
        });
        average = average/20;
        return average;
    }
}