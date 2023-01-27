import { expect } from 'chai';
import { describe, it } from 'mocha';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';

const pointBase = Object.freeze({
  value: null,
  pointDuration: 5,
  firstMeasurementTimestamp: null,
  lastMeasurementTimestamp: null,
  measurementDuration: 5,
  newest: false,
  oldest: false,
  fake: false,
});

describe('Unit | Utility | one time series chart/series functions/utils/point', function () {
  it('creates a point', function () {
    expect(point(1, 2)).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
    }));
  });

  it('creates a point without value', function () {
    expect(point(1)).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 1,
    }));
  });

  it('creates a fake point', function () {
    expect(point(1, null, { fake: true })).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 1,
      fake: true,
    }));
  });

  it('creates a newest point', function () {
    expect(point(1, 2, { newest: true })).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
      newest: true,
    }));
  });

  it('creates an oldest point', function () {
    expect(point(1, 2, { oldest: true })).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
      oldest: true,
    }));
  });

  it('correctly calculates measurementDuration for point in the middle', function () {
    expect(point(1, 2, { pointDuration: 60 }))
      .to.deep.equal(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
      }));
  });

  it('correctly calculates measurementDuration for fake point in the middle', function () {
    expect(point(1, 2, { pointDuration: 60, fake: true }))
      .to.deep.equal(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
        fake: true,
      }));
  });

  it('correctly calculates measurementDuration for point in the middle with measurement timestamps', function () {
    expect(point(1, 2, {
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 15,
    })).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 15,
      measurementDuration: 60,
    }));
  });

  it('correctly calculates measurementDuration for newest point', function () {
    expect(point(1, 2, { pointDuration: 60, newest: true }))
      .to.deep.equal(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
        newest: true,
      }));
  });

  it('correctly calculates measurementDuration for fake newest point', function () {
    expect(point(1, 2, { pointDuration: 60, fake: true, newest: true }))
      .to.deep.equal(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 1,
        newest: true,
        fake: true,
      }));
  });

  it('correctly calculates measurementDuration for newest point with measurement timestamps', function () {
    expect(point(3, 2, {
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      newest: true,
    })).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 3,
      value: 2,
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      measurementDuration: 18,
      newest: true,
    }));
  });

  it('correctly calculates measurementDuration for oldest point', function () {
    expect(point(1, 2, { pointDuration: 60, oldest: true }))
      .to.deep.equal(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
        oldest: true,
      }));
  });

  it('correctly calculates measurementDuration for fake oldest point', function () {
    expect(point(1, 2, { pointDuration: 60, fake: true, oldest: true }))
      .to.deep.equal(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 1,
        oldest: true,
        fake: true,
      }));
  });

  it('correctly calculates measurementDuration for oldest point with measurement timestamps', function () {
    expect(point(3, 2, {
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      oldest: true,
    })).to.deep.equal(Object.assign({}, pointBase, {
      timestamp: 3,
      value: 2,
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      measurementDuration: 58,
      oldest: true,
    }));
  });
});
