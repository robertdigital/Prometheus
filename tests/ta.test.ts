import { expect } from 'chai';
import 'mocha';

import { TechnicalAnalyzer } from '../dist/utilities/TAUtils';

describe('Simple Moving Average', function() {
    it('returns average', function() {
        let result = new TechnicalAnalyzer().sma([10, 11, 12], 3);
        expect(result).equal(11);
    });
});

describe('Exponential Moving Average', function() {
    it('');
});
