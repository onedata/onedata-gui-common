import { expect } from 'chai';
import { describe, it } from 'mocha';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';

describe('Unit | Utility | one time series chart/series functions/utils/point', function () {
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
