import { expect } from 'chai';
import { describe, it } from 'mocha';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';

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

describe('Unit | Utility | one-time-series-chart/point', function () {
  it('creates a point', function () {
    expect(new Point(1, 2)).to.include(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
    }));
  });

  it('creates a point without value', function () {
    expect(new Point(1)).to.include(Object.assign({}, pointBase, {
      timestamp: 1,
    }));
  });

  it('creates a fake point', function () {
    expect(new Point(1, null, { fake: true })).to.include(Object.assign({}, pointBase, {
      timestamp: 1,
      fake: true,
    }));
  });

  it('creates a newest point', function () {
    expect(new Point(1, 2, { newest: true })).to.include(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
      newest: true,
    }));
  });

  it('creates an oldest point', function () {
    expect(new Point(1, 2, { oldest: true })).to.include(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
      oldest: true,
    }));
  });

  it('correctly calculates measurementDuration for point in the middle', function () {
    expect(new Point(1, 2, { pointDuration: 60 }))
      .to.include(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
      }));
  });

  it('correctly calculates measurementDuration for fake point in the middle', function () {
    expect(new Point(1, 2, { pointDuration: 60, fake: true }))
      .to.include(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
        fake: true,
      }));
  });

  it('correctly calculates measurementDuration for point in the middle with measurement timestamps', function () {
    expect(new Point(1, 2, {
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 15,
    })).to.include(Object.assign({}, pointBase, {
      timestamp: 1,
      value: 2,
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 15,
      measurementDuration: 60,
    }));
  });

  it('correctly calculates measurementDuration for newest point', function () {
    expect(new Point(1, 2, { pointDuration: 60, newest: true }))
      .to.include(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
        newest: true,
      }));
  });

  it('correctly calculates measurementDuration for fake newest point', function () {
    expect(new Point(1, 2, { pointDuration: 60, fake: true, newest: true }))
      .to.include(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 1,
        newest: true,
        fake: true,
      }));
  });

  it('correctly calculates measurementDuration for newest point with measurement timestamps', function () {
    expect(new Point(3, 2, {
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      newest: true,
    })).to.include(Object.assign({}, pointBase, {
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
    expect(new Point(1, 2, { pointDuration: 60, oldest: true }))
      .to.include(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 60,
        oldest: true,
      }));
  });

  it('correctly calculates measurementDuration for fake oldest point', function () {
    expect(new Point(1, 2, { pointDuration: 60, fake: true, oldest: true }))
      .to.include(Object.assign({}, pointBase, {
        timestamp: 1,
        value: 2,
        pointDuration: 60,
        measurementDuration: 1,
        oldest: true,
        fake: true,
      }));
  });

  it('correctly calculates measurementDuration for oldest point with measurement timestamps', function () {
    expect(new Point(3, 2, {
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      oldest: true,
    })).to.include(Object.assign({}, pointBase, {
      timestamp: 3,
      value: 2,
      pointDuration: 60,
      firstMeasurementTimestamp: 5,
      lastMeasurementTimestamp: 20,
      measurementDuration: 58,
      oldest: true,
    }));
  });

  it('can be cloned', function () {
    const point = new Point(1, 2, {
      pointDuration: 3,
      firstMeasurementTimestamp: 4,
      lastMeasurementTimestamp: 5,
      oldest: true,
      newest: true,
      fake: true,
    });
    const pointClone = point.clone();

    expect(pointClone).to.be.instanceOf(Point);
    expect(pointClone).to.not.equal(point);
    expect(pointClone).to.deep.equal(point);
  });
});
