import { Price, Client } from "coinbase";
const API_KEY: string = process.env.API_KEY ? process.env.API_KEY : '';
const API_SECRET: string = process.env.API_SECRET ? process.env.API_SECRET : '';

const coinbaseClient: Client = new Client({ 'apiKey': API_KEY, 'apiSecret': API_SECRET });

export class APIController {


    public getBuyPrice():Promise<Price>{
        return new Promise( function(resolve,reject){
            coinbaseClient.getBuyPrice({ 'currencyPair': 'BTC-USD' },(error:Error,priceObject: Price)=>{
                if(error){
                    reject(error);
                } else {
                    resolve(priceObject);
                }
            })
        })
            
    }

}
