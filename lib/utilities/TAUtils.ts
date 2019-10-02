const RECORD_RATE: number = process.env.RECORD_RATE ? parseInt(process.env.RECORD_RATE) : 2;

/**
 * Utility class with functions to get technical indicators on a security.
 *
 * @export
 * @class TechnicalAnalyzer
 */
export class TechnicalAnalyzer {

    public sma(values: Array<number>, range: number) {
        let amount: number = 0;
        for (let i = 0; i < range; i++) {
            amount += values[i];
        }
        return amount / range
    }
    /**
     * Gets the Exponential moving average of a set of values
     * 
     *
     * @param {Array<number>} prices array of prices from most recent to least recent
     * @param {number} range the length of the moving average
     * @returns {Array<number>} array of exponential moving averages
     * @memberof TechnicalAnalyzer
     */
    public ema(values: Array<number>, range: number): Array<number> {
        // prices come in with the most recent price in position 0
        // need to reverse array for calculation then re-reverse resulting array
        let reversedValues = values.reverse();
        let k = 2 / (range + 1);
        let emaArray = [reversedValues[0]];

        for (let i = 1; i < values.length; i++) {
            emaArray.push(values[i] * k + emaArray[i - 1] * (1 - k));
        }

        emaArray = emaArray.reverse();
        return emaArray;
    }


    /**
     *
     * Base parameter is an integer from 1-4 representing the different prices to base the EMA off of
     * 1 - High,
     * 2 - Low,
     * 3 - Open,
     * 4 - Close,
     * DEFAULT - 4 (Close)
     *
     * @param {{ values: Array<Array<number>>; range: number; base?: number; }} { values, range, base =4 }
     * @returns
     * @memberof TechnicalAnalyzer
     */
    public historicEMA({ values, range, base = 4 }: { values: Array<Array<number>>; range: number; base?: number; }){
        
        let slimmedArray: Array<number> = [];
        for(let i = 0; i<values.length;i++){
            slimmedArray.push(values[i][base]);
        }
        return this.ema(slimmedArray,range);
    }

    //TO-DO: Documentation 
    // Method to return the rsi(Relative Strength Index) of a set of prices
    public rsi(values: Array<number>, range: number) {
        let averageGain = this.averageChange(values, range, true);
        let averageLoss = this.averageChange(values, range, false);

        if (averageLoss === 0) {
            return 100;
        }

        let RSI: number = 100 - (100 / (1 + (averageGain / averageLoss)));

        return RSI;
    }

    private averageChange(values: Array<number>, range: number, gainsOrLosses: boolean) {
        let reversedValues = values.reverse();
        let amount: number = 0;

        for (let i = 1; i < (range + 1); i++) {
            let change: number = reversedValues[i] - reversedValues[i - 1];
            if (gainsOrLosses) {
                if (change > 0) {
                    amount += change;
                }
            } else {
                if (change < 0) {
                    amount += Math.abs(change);
                }
            }

        }

        return amount / range;

    }

    public macd(values: Array<number>, range) {
        let macds: Array<number> = [];
        for (let i = 0; i < range; i++) {
            macds.push(this.ema(values, 12)[i] - this.ema(values, 26)[i]);
        }
        return macds;
    }

    public macdSignal(macdValues: Array<number>) {
        return this.ema(macdValues, 9);
    }

    public srsi(values: Array<number>, period: number) {
        // stoch rsi = (rsi - lowestrsi)/(highestrsi - lowestrsi)

    }



}