import { Price,Client } from 'coinbase';
import { Db } from 'mongodb';

export class Evaluator {

    public evaluatePrice(api:Client){
        api.getBuyPrice({'currencyPair':'BTC-USD'},(err:Error,price:Price)=>{
            
        });
    }

}