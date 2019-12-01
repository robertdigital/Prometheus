import { DBController } from '../controllers/DBController';
import { APIController } from '../controllers/APIController';
import { Evaluation } from '../models/dataModels';
import { Db } from 'mongodb';
import { OrderResult } from 'coinbase-pro';

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
    public executeEval(dbController: DBController, evaluation: Evaluation) {
        // Save Evaluation
        return dbController
            .connectToDatabase()
            .then((db: Db) => {
                return dbController.storeEvaluation(db, evaluation);
            })
            .then((evaluation: Evaluation) => {
                // Once the evaluation is saved, check if there is an order;
                if (evaluation.orders.length > 0) {
                    console.info('Order Request Confirmed');
                    let apiController: APIController = new APIController();
                    for (let order of evaluation.orders) {
                        console.info('attempting to place order : ', order);
                        apiController
                            .executeOrder(order)
                            .then((res: OrderResult) =>
                                console.info('Order placed successfully: ', res)
                            )
                            .catch(e => {
                                console.error(e);
                            });
                    }
                } else {
                    console.info('No Orders');
                }
            });
    }
}
