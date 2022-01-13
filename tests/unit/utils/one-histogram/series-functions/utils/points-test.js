import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  isHistogramPoint,
  isHistogramPointsArray,
  reconcileTiming,
} from 'onedata-gui-common/utils/one-histogram/series-functions/utils/points';
import { point } from '../helpers';

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

  describe('reconcileTiming', function () {
    it('aligns timings of passed series to the newest one (modifies arrays in-place)', function () {
      const seriesArray = [
        [point(10, 10), point(11, 11), point(12, 12), point(13, 13), point(14, 14)],
        [point(12, 12), point(13, 13), point(14, 14), point(15, 15), point(16, 16)],
        [point(1, 1), point(2, 2), point(3, 3), point(4, 4), point(5, 5)],
        [point(11, 11), point(12, null), point(13, null), point(14, null), point(15, null)],
      ];
      const seriesArrayShallowCopy = seriesArray.slice();
      const expectedSeriesArray = [
        [point(12, 12), point(13, 13), point(14, 14), point(15, null), point(16, null)],
        [point(12, 12), point(13, 13), point(14, 14), point(15, 15), point(16, 16)],
        [point(12, null), point(13, null), point(14, null), point(15, null), point(16, null)],
        [point(12, null), point(13, null), point(14, null), point(15, null), point(16, null)],
      ];

      const result = reconcileTiming(seriesArray);
      expect(result).to.deep.equal(expectedSeriesArray);
      // Check whether modification in-place occurred
      expect(seriesArray).to.equal(result);
      seriesArrayShallowCopy.forEach((series, idx) =>
        expect(series).to.equal(result[idx])
      );
    });
  });
});
