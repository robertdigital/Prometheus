export class TechnicalAnalyzer{

    /**
     * Gets the Exponential moving average of a set of values
     * 
     *
     * @param {Array<number>} prices array of prices from most recent to least recent
     * @param {number} range the length of the moving average
     * @returns {Array<number>} array of exponential moving averages
     * @memberof TechnicalAnalyzer
     */
    public exponentialMovingAverage(prices: Array<number>,range:number):Array<number>{
        // prices come in with the most recent price in position 0
        // need to reverse array for calculation then re-reverse resulting array
        let reversedPrices = prices.reverse();
        let k = 2/(range + 1);
        let emaArray = [reversedPrices[0]];

        for (let i = 1; i < prices.length; i++){
            emaArray.push(prices[i]*k + emaArray[i-1]*(1-k));
        }

        emaArray = emaArray.reverse();
        return emaArray;
    }
}