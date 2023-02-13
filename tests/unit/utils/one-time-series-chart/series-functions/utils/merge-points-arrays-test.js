import { expect } from 'chai';
import { describe, it } from 'mocha';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
import mergePointsArrays from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/merge-points-arrays';

describe('Unit | Utility | one time series chart/series functions/utils/merge points arrays', function () {
  it('merges points arrays preserving points flags and assigning new values', function () {
    // Points flags are not have to show some logical situation of time series points state.
    // We only have to check all possible combinations of these flags, which matter
    // during the merge.
    const pointsArrays = [
      [
        new Point(1, null, { oldest: true }),
        new Point(2, null, { oldest: true, fake: true }),
        new Point(3, null, { newest: true, fake: true }),
        new Point(4, null, { newest: true }),
        // Test measurement time transition
        // null -> some timestamp -> more "edge" timestamp
        new Point(5, null, {
          firstMeasurementTimestamp: null,
          lastMeasurementTimestamp: null,
        }),
        // Test measurement time transition
        // "edge" timestamp -> less "edge" timestamp -> null
        new Point(6, null, {
          firstMeasurementTimestamp: 6,
          lastMeasurementTimestamp: 10,
        }),
      ],
      [
        new Point(1, null, { oldest: true, fake: true }),
        new Point(2, null, { oldest: true, fake: true }),
        new Point(3, null, { newest: true, fake: true }),
        new Point(4, null, { newest: true }),
        new Point(5, null, {
          firstMeasurementTimestamp: 6,
          lastMeasurementTimestamp: 8,
        }),
        new Point(6, null, {
          firstMeasurementTimestamp: 7,
          lastMeasurementTimestamp: 9,
        }),
      ],
      [
        new Point(1, null, { oldest: true }),
        new Point(2, null, { fake: true }),
        new Point(3, null, { fake: true }),
        new Point(4, null, { newest: true }),
        new Point(5, null, {
          firstMeasurementTimestamp: 5,
          lastMeasurementTimestamp: 9,
        }),
        new Point(6, null, {
          firstMeasurementTimestamp: null,
          lastMeasurementTimestamp: null,
        }),
      ],
    ];
    const newValues = [5, 4, 3, 2, 1, 0];
    const mergedPointsArray = [
      new Point(1, 5, { oldest: true }),
      new Point(2, 4, { fake: true }),
      new Point(3, 3, { fake: true }),
      new Point(4, 2, { newest: true }),
      new Point(5, 1, {
        firstMeasurementTimestamp: 5,
        lastMeasurementTimestamp: 9,
      }),
      new Point(6, 0, {
        firstMeasurementTimestamp: 6,
        lastMeasurementTimestamp: 10,
      }),
    ];
    expect(mergePointsArrays(pointsArrays, newValues)).to.deep.equal(mergedPointsArray);
  });
});
