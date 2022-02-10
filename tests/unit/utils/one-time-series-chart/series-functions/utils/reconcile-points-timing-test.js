import { expect } from 'chai';
import { describe, it } from 'mocha';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';
import reconcilePointsTiming from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/reconcile-points-timing';

describe('Unit | Utility | one time series chart/series functions/utils/reconcile points timing', function () {
  testReconcilePointsTiming({
    description: 'aligns timings of passed series to the newest one',
    input: [
      [point(10, 10), point(11, 11), point(12, 12), point(13, 13), point(14, 14, { newest: true })],
      [point(12, 12), point(13, 13), point(14, 14), point(15, 15), point(16, 16)],
      [point(1, 1, { oldest: true }), point(2, 2), point(3, 3), point(4, 4), point(5, 5)],
      [],
      [point(11, 11), point(12, null), point(13, null), point(14, null), point(15, null)],
      [
        point(11, null, { oldest: true, fake: true }),
        point(12, null, { oldest: true, fake: true }),
        point(13, null, { oldest: true, fake: true }),
        point(14, null, { oldest: true, fake: true }),
        point(15, 15, { oldest: true }),
      ],
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
      [
        point(12, null, { oldest: true, fake: true }),
        point(13, null, { oldest: true, fake: true }),
        point(14, null, { oldest: true, fake: true }),
        point(15, 15, { oldest: true }),
        point(16, null, { fake: true }),
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
