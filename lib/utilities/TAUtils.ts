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
    public exponentialMovingAverage(values: Array<number>, range: number): Array<number> {
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

    //TO-DO: Documentation 
    public relativeStrengthIndex(values: Array<number>) {
        let averageGain = this.averageChange(values,true);
        let averageLoss = this.averageChange(values,false);

        if(averageLoss === 0){
            return 100;
        }

        let RSI: number = 100 - (100 / (1 + (averageGain/averageLoss)));

        return RSI;
    }

    private averageChange(values: Array<number>, gainsOrLosses: boolean) {
        let reversedValues = values.reverse();
        let amount: number = 0;

        for (let i = 1; i < values.length; i++) {
            let change: number = reversedValues[i] - reversedValues[i - 1];
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

        return amount / values.length;

    }



}