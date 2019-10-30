import { DBController } from "../controllers/DBController";
import { APIController } from "../controllers/APIController";
import { Evaluation } from "../models/dataModels";
import { Db } from "mongodb";

export class Executor {

    public executeEval(dbController: DBController, evaluation: Evaluation) {
        // Save Evaluation
        return dbController.connectToDatabase().then((db: Db) => { return dbController.storeEvaluation(db, evaluation) }).then(
            (evaluation: Evaluation) => {
                // Once the evaluation is saved, check if there is an order;
                if (evaluation.order) {
                    console.info("Order Request Confirmed")
                    let apiController: APIController = new APIController();
                    return apiController.executeOrder(evaluation.order);
                } else {
                    console.info("No Order");
                }
            });
    }

}