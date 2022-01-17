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
    testReconcileTiming({
      description: 'aligns timings of passed series to the newest one',
      input: [
        [point(10, 10), point(11, 11), point(12, 12), point(13, 13), point(14, 14, { newest: true })],
        [point(12, 12), point(13, 13), point(14, 14), point(15, 15), point(16, 16)],
        [point(1, 1, { oldest: true }), point(2, 2), point(3, 3), point(4, 4), point(5, 5)],
        [],
        [point(11, 11), point(12, null), point(13, null), point(14, null), point(15, null)],
      ],
      output: [
        [
          point(12, 12),
          point(13, 13),
          point(14, 14, { newest: true }),
          point(15, null, { fake: true, newest: true }),
          point(16, null, { fake: true, newest: true }),
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
          point(12, null, { fake: true, newest: true, oldest: true }),
          point(13, null, { fake: true, newest: true, oldest: true }),
          point(14, null, { fake: true, newest: true, oldest: true }),
          point(15, null, { fake: true, newest: true, oldest: true }),
          point(16, null, { fake: true, newest: true, oldest: true }),
        ],
        [
          point(12, null),
          point(13, null),
          point(14, null),
          point(15, null),
          point(16, null, { fake: true }),
        ],
      ],
    });

    testReconcileTiming({
      description: 'returns the same empty arrays when all passed series are empty',
      input: [
        [],
        [],
        [],
      ],
      output: [
        [],
        [],
        [],
      ],
    });
  });
});

function testReconcileTiming({ description, input, output }) {
  it(description, function () {
    const inputShallowCopy = input.slice();

    const result = reconcileTiming(input);
    expect(result).to.deep.equal(output);
    // Check whether modification in-place occurred
    expect(input).to.equal(result);
    inputShallowCopy.forEach((series, idx) =>
      expect(series).to.equal(result[idx])
    );
  });
}
