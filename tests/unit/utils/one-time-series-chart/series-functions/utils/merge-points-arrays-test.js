import { expect } from 'chai';
import { describe, it } from 'mocha';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';
import mergePointsArrays from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/merge-points-arrays';

describe('Unit | Utility | one time series chart/series functions/utils/merge points arrays', function () {
  it('merges points arrays preserving points flags and assigning new values', function () {
    // Points flags are not have to show some logical situation of time series points state.
    // We only have to check all possible combinations of these flags, which matter
    // during the merge.
    const pointsArrays = [
      [
        point(1, null, { oldest: true }),
        point(2, null, { oldest: true, fake: true }),
        point(3, null, { newest: true, fake: true }),
        point(4, null, { newest: true }),
        // Test measurement time transition
        // null -> some timestamp -> more "edge" timestamp
        point(5, null, {
          firstMeasurementTimestamp: null,
          lastMeasurementTimestamp: null,
        }),
        // Test measurement time transition
        // "edge" timestamp -> less "edge" timestamp -> null
        point(6, null, {
          firstMeasurementTimestamp: 6,
          lastMeasurementTimestamp: 10,
        }),
      ],
      [
        point(1, null, { oldest: true, fake: true }),
        point(2, null, { oldest: true, fake: true }),
        point(3, null, { newest: true, fake: true }),
        point(4, null, { newest: true }),
        point(5, null, {
          firstMeasurementTimestamp: 6,
          lastMeasurementTimestamp: 8,
        }),
        point(6, null, {
          firstMeasurementTimestamp: 7,
          lastMeasurementTimestamp: 9,
        }),
      ],
      [
        point(1, null, { oldest: true }),
        point(2, null, { fake: true }),
        point(3, null, { fake: true }),
        point(4, null, { newest: true }),
        point(5, null, {
          firstMeasurementTimestamp: 5,
          lastMeasurementTimestamp: 9,
        }),
        point(6, null, {
          firstMeasurementTimestamp: null,
          lastMeasurementTimestamp: null,
        }),
      ],
    ];
    const newValues = [5, 4, 3, 2, 1, 0];
    const mergedPointsArray = [
      point(1, 5, { oldest: true }),
      point(2, 4, { fake: true }),
      point(3, 3, { fake: true }),
      point(4, 2, { newest: true }),
      point(5, 1, {
        firstMeasurementTimestamp: 5,
        lastMeasurementTimestamp: 9,
      }),
      point(6, 0, {
        firstMeasurementTimestamp: 6,
        lastMeasurementTimestamp: 10,
      }),
    ];
    expect(mergePointsArrays(pointsArrays, newValues)).to.deep.equal(mergedPointsArray);
  });
});
