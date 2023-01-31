import { expect } from 'chai';
import { describe, it } from 'mocha';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
import reconcilePointsTiming from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/reconcile-points-timing';

describe('Unit | Utility | one time series chart/series functions/utils/reconcile points timing', function () {
  testReconcilePointsTiming({
    description: 'aligns timings of passed series to the newest one',
    input: [
      [
        new Point(10, 10),
        new Point(11, 11),
        new Point(12, 12),
        new Point(13, 13),
        new Point(14, 14, { newest: true }),
      ],
      [
        new Point(12, 12),
        new Point(13, 13),
        new Point(14, 14),
        new Point(15, 15),
        new Point(16, 16),
      ],
      [
        new Point(1, 1, { oldest: true }),
        new Point(2, 2),
        new Point(3, 3),
        new Point(4, 4),
        new Point(5, 5),
      ],
      [],
      [
        new Point(11, 11),
        new Point(12, null),
        new Point(13, null),
        new Point(14, null),
        new Point(15, null),
      ],
      [
        new Point(11, null, { oldest: true, fake: true }),
        new Point(12, null, { oldest: true, fake: true }),
        new Point(13, null, { oldest: true, fake: true }),
        new Point(14, null, { oldest: true, fake: true }),
        new Point(15, 15, { oldest: true }),
      ],
    ],
    output: [
      [
        new Point(12, 12),
        new Point(13, 13),
        new Point(14, 14, { newest: true }),
        new Point(15, null, { fake: true, newest: true }),
        new Point(16, null, { fake: true, newest: true }),
      ],
      [
        new Point(12, 12),
        new Point(13, 13),
        new Point(14, 14),
        new Point(15, 15),
        new Point(16, 16),
      ],
      [
        new Point(12, null, { fake: true }),
        new Point(13, null, { fake: true }),
        new Point(14, null, { fake: true }),
        new Point(15, null, { fake: true }),
        new Point(16, null, { fake: true }),
      ],
      [
        new Point(12, null, { fake: true, newest: true, oldest: true }),
        new Point(13, null, { fake: true, newest: true, oldest: true }),
        new Point(14, null, { fake: true, newest: true, oldest: true }),
        new Point(15, null, { fake: true, newest: true, oldest: true }),
        new Point(16, null, { fake: true, newest: true, oldest: true }),
      ],
      [
        new Point(12, null),
        new Point(13, null),
        new Point(14, null),
        new Point(15, null),
        new Point(16, null, { fake: true }),
      ],
      [
        new Point(12, null, { oldest: true, fake: true }),
        new Point(13, null, { oldest: true, fake: true }),
        new Point(14, null, { oldest: true, fake: true }),
        new Point(15, 15, { oldest: true }),
        new Point(16, null, { fake: true }),
      ],
    ],
  });

  testReconcilePointsTiming({
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

function testReconcilePointsTiming({ description, input, output }) {
  it(description, function () {
    const inputShallowCopy = input.slice();

    const result = reconcilePointsTiming(input);
    expect(result).to.deep.equal(output);
    // Check whether modification in-place occurred
    expect(input).to.equal(result);
    inputShallowCopy.forEach((series, idx) =>
      expect(series).to.equal(result[idx])
    );
  });
}
