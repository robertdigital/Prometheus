import { Db, MongoClient } from 'mongodb';
import { Evaluation } from '../models/dataModels';

const MONGODB_URI: string = process.env.MONGODB_URI
    ? process.env.MONGODB_URI
    : '';
const DB_NAME: string = process.env.TEST
    ? process.env.DB_NAME_TEST
    : process.env.DB_NAME;
const PRICE_COLLECTION: string = process.env.PRICE_COLLECTION
    ? process.env.PRICE_COLLECTION
    : '';

export class DBController {
    private cachedDb: Db | null = null;

    public connectToDatabase(): Promise<Db> {
        if (this.cachedDb) {
            console.info('***Using cached DB***');
            return Promise.resolve(this.cachedDb);
        } else {
            console.info('***Creating new DB connection instance***');
            return MongoClient.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
                .then(Client => {
                    this.cachedDb = Client.db(DB_NAME);
                    console.info(
                        '***Successfully established DB Connection***'
                    );
                    return this.cachedDb;
                })
                .catch(e => {
                    console.error(
                        'Error: connectToDatabase - MongoClient.connect(uri,params) encountered an exception'
                    );
                    console.error(e);
                    return null;
                });
        }
    }

    public storeEvaluation(db: Db, data: Evaluation): Promise<Evaluation> {
        return db
            .collection(PRICE_COLLECTION)
            .insertOne(data)
            .then(() => {
                console.info('***Evaluation Stored Successfully***');
                return data;
            })
            .catch(e => {
                console.error(
                    'Error: storeEvaluation - collection(x).insertOne(y) encountered an exception'
                );
                console.error(e);
                return null;
            });
    }

    /**
     * retrieves the previous evaluation from the database.
     *
     * @param {Db} db
     * @returns {Promise<Array<any>>}
     * @memberof DBController
     */
    public getLastEvaluation(db: Db): Promise<Array<any>> {
        return db
            .collection(PRICE_COLLECTION)
            .find({})
            .limit(1)
            .sort({ $natural: -1 })
            .toArray();
    }
}
