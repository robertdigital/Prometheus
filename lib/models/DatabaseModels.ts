
/**
 * Model used for storing the current price of a currency to the database.
 *
 * @export
 * @class PriceDataModel
 */
export class PriceDataModel {
    public date: Date;
    public price: number;
    public dayMark: number;

    constructor(p: number, mark: number = 0) {
        this.date = new Date();
        this.price = p;
        this.dayMark = mark;
    }
}