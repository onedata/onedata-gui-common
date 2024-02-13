import { expect } from 'chai';
import { describe, it } from 'mocha';
import includesAll from 'onedata-gui-common/utils/includes-all';

describe('Unit | Utility | includes-all', function () {
  it('returns true if superset includes all of subset elements', function () {
    const superset = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const subset = [3, 6, 9];

    const result = includesAll(superset, subset);

    expect(result).to.be.true;
  });

  it('returns false if superset includes only part of subset elements', function () {
    const superset = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const subset = [3, 6, 9, 12];

    const result = includesAll(superset, subset);

    expect(result).to.be.false;
  });

  it('returns false if superset does not include any of subset elements', function () {
    const superset = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const subset = [12, 14];

    const result = includesAll(superset, subset);

    expect(result).to.be.false;
  });

  it('returns false if subset is larger than superset', function () {
    const superset = [1, 2, 3];
    const subset = [1, 2, 3, 4];

    const result = includesAll(superset, subset);

    expect(result).to.be.false;
  });

  it('returns false if subset is empty', function () {
    const superset = [1, 2, 3];
    const subset = [];

    const result = includesAll(superset, subset);

    expect(result).to.be.false;
  });

  it('returns false if subset is undefined', function () {
    const superset = [1, 2, 3];

    const result = includesAll(superset);

    expect(result).to.be.false;
  });
});
