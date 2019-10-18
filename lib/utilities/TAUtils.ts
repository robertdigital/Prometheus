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
     * Gets the exponential moving average of a set of values
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
        let reversedValues = values.slice(0);
        reversedValues.reverse();
        let k = 2 / (range + 1);
        let emaArray = [this.sma(reversedValues,range)];
        for (let i = 1; i < reversedValues.length; i++) {
            emaArray.push(reversedValues[i] * k + emaArray[i- 1] * (1 - k));
        }
        emaArray.reverse();
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
    public historicEMA({ values, range, base = 4 }: { values: Array<Array<number>>; range: number; base?: number; }): Array<number> {
        return this.ema(this.slimHistory(values,4), range);
    }

    //TO-DO: Documentation 
    // Method to return the rsi(Relative Strength Index) of a set of prices
    public rsi(values: Array<number>, range: number): number {
        let averageGain = this.averageChange(values, range, true);
        let averageLoss = this.averageChange(values, range, false);

        if (averageLoss === 0) {
            return 100;
        }

        let RSI: number = 100 - (100 / (1 + (averageGain / averageLoss)));

        return RSI;
    }

    private averageChange(values: Array<number>, range: number, gainsOrLosses: boolean): number {
        let reversedValues = values.slice(0);
        reversedValues.reverse();
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

    public macd(values: Array<Array<number>>, range): Array<number> {
        let macds: Array<number> = [];
        let ema12: Array<number> = this.historicEMA({values:values, range: 12});
        let ema26: Array<number> = this.historicEMA({values:values, range: 26});
        for (let i = 0; i < range; i++) {
            macds.push(ema12[i] - ema26[i]);
        }
        return macds;
    }

    public macdSignal(macdValues: Array<number>): Array<number> {
        return this.ema(macdValues, 9);
    }

    /**
     * Gets the stochastic relative strength index of a set of values over a period.
     * 
     * ref: https://www.investopedia.com/terms/s/stochrsi.asp
     *
     * @param {Array<number>} values
     * @param {number} period
     * @returns
     * @memberof TechnicalAnalyzer
     */
    public srsi(values: Array<number>, period: number): number {
        // stoch rsi = (rsi - lowestrsi)/(highestrsi - lowestrsi)
        //find rsi for each day of the array for the required period
        if (values.length < (period * 2)) {
            return;
        }
        let rsiList: Array<number> = [];
        for (let i = 0; i < period; i++) {
            rsiList.push(this.rsi(values.slice(i, period + i), period));
        }
        let high = Math.max(...rsiList);
        let low = Math.min(...rsiList);
        return ((rsiList[0] - low) / (high - low));
    }

    /**
     * Gets the fibanocci retracement levels for a given value range.
     * levels calculated are for:
     * 
     *  (0, 23.6, 38.2, 50, 61.8, 78.6, 100)
     *
     * @param {number} start
     * @param {number} end
     * @returns {Array<number>}
     * @memberof TechnicalAnalyzer
     */
    public fibRetracements(start: number, end: number): Array<number> {
        let levels: number[] = [0, 23.6, 38.2, 50, 61.8, 78.6, 100];
        let retLevels: number[];

        if (start < end) {
            retLevels = levels.map((level: number) => {
                let lvl: number = end - (Math.abs(start - end) * (level / 100))
                return lvl;
            })
        } else {
            retLevels = levels.map((level: number) => {
                let lvl: number = end + (Math.abs(start - end) * (level / 100))
                return lvl;
            })
        }

        return retLevels;
    }

    public slimHistory(history: Array<Array<number>>,base:number){
        let slimmedArray: Array<number> = [];
        for (let i = 0; i < history.length; i++) {
            slimmedArray.push(history[i][base]);
        }
        return slimmedArray;
    }


}