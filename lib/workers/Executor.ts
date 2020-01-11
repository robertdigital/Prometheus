import { Evaluation } from "../models/dataModels";
import { DBService } from "../services/DBService";
import { APIService } from "../services/APIService";

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
        dbService: DBService,
        apiService: APIService,
        evaluation: Evaluation,
        collection: string
    ): Promise<Array<any>> {
        // Save Evaluation -- keep in mind that the evaluation is stored before the orders are placed
        return dbService.storeEvaluation(evaluation, collection)
            .then((evaluation: Evaluation) => {
                // Once the evaluation is saved, check if there is an order;
                if (evaluation.orders.length > 0) {
                    console.info("Order Request Confirmed");
                    let orders = evaluation.orders.length;
                    console.log(orders + " orders to place");
                    return apiService.executeMultipleOrders(evaluation.orders);
                } else {
                    console.info("No Orders");
                    return [];
                }
            });
    }
    public executeMultipleEvals(
        dbService: DBService,
        apiService: APIService,
        evaluations: Array<Evaluation>,
        collections: Array<string>
    ): Promise<Array<Array<any>>> {
        let promises = [];
        for (let i = 0; i < evaluations.length; i++) {
            promises.push(this.executeEval(dbService, apiService, evaluations[i], collections[i]));
        }
        return Promise.all(promises);
    }
}
