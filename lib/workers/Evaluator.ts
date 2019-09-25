import { Price,Client } from 'coinbase';
import { Db } from 'mongodb';

export class Evaluator {

    public async evaluatePrice(price: number,movingAverage:number){
        console.log(price);
        return true;
    }

}