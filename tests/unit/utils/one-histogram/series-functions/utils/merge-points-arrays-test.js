import { expect } from 'chai';
import { describe, it } from 'mocha';
import point from 'onedata-gui-common/utils/one-histogram/series-functions/utils/point';
import mergePointsArrays from 'onedata-gui-common/utils/one-histogram/series-functions/utils/merge-points-arrays';

describe('Unit | Utility | one histogram/series functions/utils/merge points arrays', function () {
  it('merges points arrays preserving points flags and assigning new values', function () {
    // Points flags are not have to show some logical situation of time series points state.
    // We only have to check all possible combinations of these flags, which matter
    // during the merge.
    const pointsArrays = [
      [
        point(1, null, { oldest: true }),
        point(2, null, { oldest: true, fake: true }),
        point(2, null, { newest: true, fake: true }),
        point(3, null, { newest: true }),
      ],
      [
        point(1, null, { oldest: true, fake: true }),
        point(2, null, { oldest: true, fake: true }),
        point(2, null, { newest: true, fake: true }),
        point(3, null, { newest: true }),
      ],
      [
        point(1, null, { oldest: true }),
        point(2, null, { fake: true }),
        point(2, null, { fake: true }),
        point(3, null, { newest: true }),
      ],
    ];
    const newValues = [5, 4, 3, 2];
    const mergedPointsArray = [
      point(1, 5, { oldest: true }),
      point(2, 4, { fake: true }),
      point(2, 3, { fake: true }),
      point(3, 2, { newest: true }),
    ];
    expect(mergePointsArrays(pointsArrays, newValues)).to.deep.equal(mergedPointsArray);
  });
});
