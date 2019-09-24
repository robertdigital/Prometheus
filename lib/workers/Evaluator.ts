import { Price,Client } from 'coinbase';
import { Db } from 'mongodb';

export class Evaluator {

    public evaluatePrice(price: number):boolean{
        console.log(price);
        return true;
    }

}