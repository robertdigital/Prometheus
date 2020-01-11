import { DBRepository } from "../controllers/DBRepository";
import { APIRepository } from "../controllers/APIRepository";
import { Evaluation } from "../models/dataModels";
import { Db } from "mongodb";
import { OrderResult, OrderParams } from "coinbase-pro";

export class Executor {
    /**
     *
     * Using an evaluation provided, places an order on the market when prompted.
     *
     * @param {DBRepository} dbRepository
     * @param {Evaluation} evaluation
     * @returns
     * @memberof Executor
     */
    public async executeEval(
        dbRepository: DBRepository,
        evaluation: Evaluation
    ): Promise<Array<any>> {
        // Save Evaluation -- keep in mind that the evaluation is stored before the orders are placed
        return dbRepository
            .connectToDatabase()
            .then((db: Db) => {
                return dbRepository.storeEvaluation(db, "BTC-USD", evaluation);
            })
            .then((evaluation: Evaluation) => {
                // Once the evaluation is saved, check if there is an order;
                if (evaluation.orders.length > 0) {
                    console.info("Order Request Confirmed");
                    let apiRepository: APIRepository = new APIRepository();
                    let orders = evaluation.orders.length;
                    console.log(orders + " orders to place");
                    let promises = evaluation.orders.map((order: OrderParams) =>
                        apiRepository.executeOrder(order)
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
    public executeMultipleEvals(
        dbRepository: DBRepository,
        evaluations: Array<Evaluation>
    ): Promise<Array<Array<any>>> {
        let promises = [];
        for (let evaluation of evaluations) {
            promises.push(this.executeEval(dbRepository, evaluation));
        }
        return Promise.all(promises);
    }
}
