
/**
 * Model used for storing the current price of a currency to the database.
 *
 * @export
 * @class PriceDataModel
 */
export class PriceDataModel {
    public date: Date;
    public price: number;

    constructor(p: number) {
        this.date = new Date();
        this.price = p;
    }
}