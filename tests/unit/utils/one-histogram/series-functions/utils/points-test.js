import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  isHistogramPoint,
  isHistogramPointsArray,
} from 'onedata-gui-common/utils/one-histogram/series-functions/utils/points';

describe('Unit | Utility | one histogram/series functions/utils/points', function () {
  describe('isHistogramPoint', function () {
    [null, undefined, 123, {}, { value: 123 }, { timestamp: 123 }].forEach((value) => {
      it(`returns false for value ${JSON.stringify(value)}`, function () {
        expect(isHistogramPoint(value)).to.be.false;
      });
    });

    [{ timestamp: 123, value: 123 }, { timestamp: 123, value: null }].forEach((value) => {
      it(`returns true for value ${JSON.stringify(value)}`, function () {
        expect(isHistogramPoint(value)).to.be.true;
      });
    });
  });

  describe('isHistogramPointsArray', function () {
    [
      null,
      undefined,
      123,
      {},
      { timestamp: 123, value: 123 },
      [],
      [null],
      [123],
      [{ timestamp: 123, value: 123 }, 123],
    ].forEach((value) => {
      it(`returns false for value ${JSON.stringify(value)}`, function () {
        expect(isHistogramPointsArray(value)).to.be.false;
      });
    });

    [
      [{ timestamp: 123, value: 123 }],
      [{ timestamp: 123, value: 123 }, { timestamp: 234, value: null }],
    ].forEach((value) => {
      it(`returns true for value ${JSON.stringify(value)}`, function () {
        expect(isHistogramPointsArray(value)).to.be.true;
      });
    });
  });
});
