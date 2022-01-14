import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  point,
  reconcileTiming,
} from 'onedata-gui-common/utils/one-histogram/series-functions/utils/points';

describe('Unit | Utility | one histogram/series functions/utils/points', function () {
  describe('point', function () {
    it('creates a point', function () {
      expect(point(1, 2)).to.deep.equal({
        timestamp: 1,
        value: 2,
        newest: false,
        oldest: false,
        fake: false,
      });
    });

    it('creates a point without value', function () {
      expect(point(1)).to.deep.equal({
        timestamp: 1,
        value: null,
        newest: false,
        oldest: false,
        fake: false,
      });
    });

    it('creates a fake point', function () {
      expect(point(1, null, { fake: true })).to.deep.equal({
        timestamp: 1,
        value: null,
        newest: false,
        oldest: false,
        fake: true,
      });
    });

    it('creates a newest point', function () {
      expect(point(1, 2, { newest: true })).to.deep.equal({
        timestamp: 1,
        value: 2,
        newest: true,
        oldest: false,
        fake: false,
      });
    });

    it('creates an oldest point', function () {
      expect(point(1, 2, { oldest: true })).to.deep.equal({
        timestamp: 1,
        value: 2,
        newest: false,
        oldest: true,
        fake: false,
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
        [
          point(12, 12),
          point(13, 13),
          point(14, 14),
          point(15, null, { fake: true }),
          point(16, null, { fake: true }),
        ],
        [
          point(12, 12),
          point(13, 13),
          point(14, 14),
          point(15, 15),
          point(16, 16),
        ],
        [
          point(12, null, { fake: true }),
          point(13, null, { fake: true }),
          point(14, null, { fake: true }),
          point(15, null, { fake: true }),
          point(16, null, { fake: true }),
        ],
        [
          point(12, null),
          point(13, null),
          point(14, null),
          point(15, null),
          point(16, null, { fake: true }),
        ],
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
