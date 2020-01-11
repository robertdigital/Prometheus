import { DBRepository } from '../repositories/DBRepository';
import { Evaluation } from '../models/dataModels';
import { Db } from 'mongodb';

export class DBService {
    private dbRepo: DBRepository;

    public storeEvaluation(evaluation: Evaluation, collection: string): Promise<Evaluation> {
        if (!this.dbRepo) {
            this.dbRepo = new DBRepository();
        }
        return this.dbRepo.connectToDatabase().then((db: Db) => {
            return this.dbRepo.storeEvaluation(db, collection, evaluation);
        })

    }

    public getMostRecentEvaluations(collections: Array<string>): Promise<Array<Array<Evaluation>>> {
        if (!this.dbRepo) {
            this.dbRepo = new DBRepository();
        }
        return this.dbRepo.connectToDatabase().then((db: Db) => {
            return this.dbRepo.getLastEvaluations(db, collections);
        })
    }

}