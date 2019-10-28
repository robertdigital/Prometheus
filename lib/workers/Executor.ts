import { DBController } from "../controllers/DBController";
import { APIController } from "../controllers/APIController";
import { Evaluation } from "../models/dataModels";
import { Db } from "mongodb";

export class Executor {
    public executeEval(dbController: DBController, evaluation: Evaluation) {
        return dbController.connectToDatabase().then((db: Db) => { return dbController.storeEvaluation(db, evaluation) }).then(
            (evaluation: Evaluation) => {
                if (evaluation.order) {
                    let apiController: APIController = new APIController();
                    apiController.executeOrder(evaluation);
                }
            });
    }
}