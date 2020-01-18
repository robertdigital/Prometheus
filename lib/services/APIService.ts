import { APIRepository } from '../repositories/APIRepository';
import { ProductTicker, Account, OrderParams, OrderResult } from 'coinbase-pro';

export class APIService {
    private apiRepo: APIRepository;

    public getProducts() {
        return this.apiRepo.getProducts();
    }

    public getTickers(currencies): Promise<Array<ProductTicker>> {
        let promises: Array<Promise<ProductTicker>> = [];
        if (!this.apiRepo) {
            this.apiRepo = new APIRepository();
        }
        for (let currency of currencies) {
            promises.push(this.apiRepo.getTicker(currency));
        }
        return Promise.all(promises);
    }

    public getAccounts(): Promise<Array<Account>> {
        if (!this.apiRepo) {
            this.apiRepo = new APIRepository();
        }
        return this.apiRepo.getAccounts();
    }

    public getOrderBooks(currencies: Array<string>): Promise<Array<any>> {
        if (!this.apiRepo) {
            this.apiRepo = new APIRepository();
        }
        return this.apiRepo.getOrderBooks(currencies);
    }

    public getHistoricClosingRatesByDayPerCurrency(range: number, currencies: Array<string>) {
        if (!this.apiRepo) {
            this.apiRepo = new APIRepository();
        }
        return this.apiRepo.getMultipleHistoricClosingRatesByDay(range, currencies);
    }

    public executeMultipleOrders(orders: Array<OrderParams>): Promise<Array<OrderResult>> {
        if (!this.apiRepo) {
            this.apiRepo = new APIRepository();
        }
        let promises = orders.map((order: OrderParams) =>
            this.apiRepo.executeOrder(order)
        );
        return Promise.all(promises).then(
            (Responses: Array<OrderResult>) => {
                console.log(Responses);
                return Responses;
            }
        );
    }
}