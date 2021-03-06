import { DBController } from "../controllers/DBController";
import { APIController } from "../controllers/APIController";
import { Evaluation } from "../models/dataModels";
import { Db } from "mongodb";
import { OrderResult, OrderParams } from "coinbase-pro";

export class Executor {
    /**
     *
     * Using an evaluation provided, places an order on the market when prompted.
     *
     * @param {DBController} dbController
     * @param {Evaluation} evaluation
     * @returns
     * @memberof Executor
     */
    public async executeEval(
        dbController: DBController,
        evaluation: Evaluation
    ) {
        // Save Evaluation -- keep in mind that the evaluation is stored before the orders are placed
        return dbController
            .connectToDatabase()
            .then((db: Db) => {
                return dbController.storeEvaluation(db, evaluation);
            })
            .then((evaluation: Evaluation) => {
                // Once the evaluation is saved, check if there is an order;
                if (evaluation.orders.length > 0) {
                    console.info("Order Request Confirmed");
                    let apiController: APIController = new APIController();
                    let orders = evaluation.orders.length;
                    console.log(orders + " orders to place");
                    let promises = evaluation.orders.map((order: OrderParams) =>
                        apiController.executeOrder(order)
                    );
                    return Promise.all(promises).then(
                        (Responses: Array<OrderResult>) => {
                            console.log(Responses);
                            return Responses;
                        }
                    );
                } else {
                    console.info("No Orders");
                    return [];
                }
            });
    }
}
