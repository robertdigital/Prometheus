/**
 * Utility class with functions to get technical indicators on a security.
 *
 * @export
 * @class TechnicalAnalyzer
 */
export class TechnicalAnalyzer {

    /**
     * Gets the Exponential moving average of a set of values
     * 
     *
     * @param {Array<number>} prices array of prices from most recent to least recent
     * @param {number} range the length of the moving average
     * @returns {Array<number>} array of exponential moving averages
     * @memberof TechnicalAnalyzer
     */
    public ema(prices: Array<number>, range: number): Array<number> {
        // prices come in with the most recent price in position 0
        // need to reverse array for calculation then re-reverse resulting array
        let reversedPrices = prices.reverse();
        let k = 2 / (range + 1);
        let emaArray = [reversedPrices[0]];

        for (let i = 1; i < prices.length; i++) {
            emaArray.push(prices[i] * k + emaArray[i - 1] * (1 - k));
        }

        emaArray = emaArray.reverse();
        return emaArray;
    }

    //TO-DO: Documentation 
    // Method to return the rsi(Relative Strength Index) of a set of prices
    public rsi(prices: Array<number>) {
        let averageGain = this.averageChange(prices,true);
        let averageLoss = this.averageChange(prices,false);

        if(averageLoss === 0){
            return 100;
        }

        let RSI: number = 100 - (100 / (1 + (averageGain/averageLoss)));

        return RSI;
    }

    private averageChange(prices: Array<number>, gainsOrLosses: boolean) {
        let reversedPrices = prices.reverse();
        let amount: number = 0;

        for (let i = 1; i < prices.length; i++) {
            let change: number = reversedPrices[i] - reversedPrices[i - 1];
            if (gainsOrLosses) {
                if (change > 0) {
                    amount += change;
                }
            } else {
                if(change<0){
                    amount += Math.abs(change);
                }
            }

        }

        return amount / prices.length;

    }

    public sma(values: Array<number>, range: number){
        let amount: number = 0;
        for(let i=0; i<range;i++){
            amount += values[i];
        }
        return amount/range
    }

    public macd(values:Array<number>){
        let twelvePointEMA = this.ema(values,12)[0];
        let twentySixPointEMA = this.ema(values,26)[0];
        return (twelvePointEMA - twentySixPointEMA);
    }



}