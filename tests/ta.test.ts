import { expect } from 'chai';
import 'mocha';

import { TechnicalAnalyzer } from '../dist/utilities/TAUtils';

describe('Simple Moving Average', function () {
    it('returns average', function () {
        let result = new TechnicalAnalyzer().sma([10, 11, 12], 3);
        expect(result).equal(11);
    });
});

describe('Exponential Moving Average', function () {
    it('returns exponential average', function () {
        let result = new TechnicalAnalyzer().ema(
            [1.5554, 1.5555, 1.5558, 1.556],
            4
        );
        expect(result[0]).equal(1.555541);
    });
});
