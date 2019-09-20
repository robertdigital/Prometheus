import * as request from "request-promise-native";

const COINBASE_API: string = process.env.COINBASE_API ? process.env.COINBASE_API : '';
/**
 * Class to get data from Coinbase API
 * 
 */
export class DataService {

    private options = {
        uri: COINBASE_API
    };
    /**
     * retrieves the current price for bitcoin from Coinbase
     *
     * @returns {Promise<string>}
     * @memberof DataService
     */
    public async getCurrentPrice(): Promise<string> {
       return request.get(this.options);
    }
}
