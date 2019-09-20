export class PriceDataModel {
    public date:Date;
    public price: number;

    constructor(p:number){
        this.date = new Date();
        this.price = p;
    }
}