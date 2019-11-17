import { Handler, Context, Callback } from "aws-lambda";
import { Db } from "mongodb";
import { DBController } from "./controllers/DBController";
import { APIController } from "./controllers/APIController";
import { Evaluator } from "./workers/Evaluator";
import { Executor } from "./workers/Executor";
import { Evaluation } from "./models/dataModels";

let dbController: DBController | null = null;
let apiController: APIController | null = null;
let evaluator: Evaluator | null = null;
let executor: Executor | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!apiController) {
    apiController = new APIController();
  }
  if (!dbController) {
    dbController = new DBController();
  }

  let currency = "BTC-USD";
  Promise.all([
    apiController.getTicker(currency),
    apiController.getAccounts(),
    apiController.getOrderBook(currency),
    apiController.getHistoricClosingRatesByDay(100, currency),
    dbController.connectToDatabase().then((db: Db) => {
      return dbController.getLastEvaluation(db);
    })
  ])
    .then((res: any[]) => {
      if (!evaluator) {
        evaluator = new Evaluator();
      }
      return evaluator.evaluateConditions(
        res[0],
        res[1],
        res[2],
        res[3],
        res[4][0]
      );
    })
    .then((evaluation: Evaluation) => {
      if (!executor) {
        executor = new Executor();
      }
      return executor.executeEval(dbController, evaluation);
    })
    .then(() => {
      callback(null, "Complete");
    })
    .catch(e => {
      callback(e);
    });
};

export { handler };
