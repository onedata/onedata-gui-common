import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import {
  createDummySource,
  createDummyConfiguration,
  createModel,
} from '../../../helpers/one-time-series-chart';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe('Unit | Utility | one time series chart/model', function () {
  beforeEach(function () {
    const now = Date.now();
    this.fakeClock = sinon.useFakeTimers({
      now: now - (now % 60000) - 35000,
      shouldAdvanceTime: true,
    });
  });

  afterEach(function () {
    if (this.model && !get(this.model, 'isDestroyed')) {
      this.model.destroy();
    }
    this.fakeClock.restore();
  });

  it('takes view parameters from configuration on init and saves as lastViewParameters',
    function () {
      const config = createDummyConfiguration();
      config.setViewParameters({
        lastPointTimestamp: 1234,
      });
      setupModel(this, config);

      expect(get(this.model, 'lastViewParameters')).to.deep.equal(config.getViewParameters());
    });

  it('takes new view parameters from configuration and saves as lastViewParameters',
    function () {
      const config = createDummyConfiguration();
      setupModel(this, config);
      config.setViewParameters({
        lastPointTimestamp: 1234,
      });

      expect(get(this.model, 'lastViewParameters')).to.deep.equal(config.getViewParameters());
    });

  it('takes new view parameters and saves as lastViewParameters', function () {
    const config = createDummyConfiguration();
    setupModel(this, config);
    this.model.setViewParameters({
      lastPointTimestamp: 1234,
    });

    expect(get(this.model, 'lastViewParameters')).to.deep.equal(config.getViewParameters())
      .and.to.include({ lastPointTimestamp: 1234 });
  });

  it('contains promisified state in stateProxy', async function () {
    setupModel(this, createDummyConfiguration());

    await expectStateToHaveUpdatedPoints(this);
  });

  it('updates state in stateProxy when configuration is in live mode', async function () {
    setupModel(this, createDummyConfiguration());
    this.model.setViewParameters({
      live: true,
    });

    const values1 = await expectStateToHaveUpdatedPoints(this);
    this.fakeClock.tick(61 * 1000);
    await wait();
    const values2 = await expectStateToHaveUpdatedPoints(this);

    expect(values1).to.not.deep.equal(values2);
  });

  it('stops updating state in stateProxy when configuration is in live mode but model was destroyed',
    async function () {
      setupModel(this, createDummyConfiguration());
      this.model.setViewParameters({
        live: true,
      });

      const values1 = await getStatePointsValues(this);
      this.model.destroy();
      this.fakeClock.tick(61 * 1000);
      await wait();
      const values2 = await getStatePointsValues(this);

      expect(values1).to.deep.equal(values2);
    });
});

function setupModel(testCase, config) {
  return testCase.model = createModel(config);
}

async function expectStateToHaveUpdatedPoints(testCase) {
  const statePointsValues = await getStatePointsValues(testCase);
  const updatedValues = createDummySource()
    .fetchSeries({
      lastPointTimestmap: get(testCase.model, 'configuration').getViewParameters().lastPointTimestamp,
      timeResolution: 60,
      pointsCount: 60,
    }).mapBy('value');
  expect(statePointsValues).to.deep.equal(updatedValues);
  return updatedValues;
}

async function getStatePointsValues(testCase) {
  await get(testCase.model, 'stateProxy');
  return get(get(testCase.model, 'stateProxy'), 'content').series[0].data.mapBy('value');
}
