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
    this.fakeClock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });
  });

  afterEach(function () {
    this.fakeClock.restore();
  });

  it('takes view parameters from configuration on init and saves as lastViewParameters',
    function () {
      const config = createDummyConfiguration();
      config.setViewParameters({
        lastWindowTimestamp: 1234,
      });
      const model = createModel(config);

      expect(get(model, 'lastViewParameters')).to.deep.equal(config.getViewParameters());
    });

  it('takes new view parameters from configuration and saves as lastViewParameters',
    function () {
      const config = createDummyConfiguration();
      const model = createModel(config);
      config.setViewParameters({
        lastWindowTimestamp: 1234,
      });

      expect(get(model, 'lastViewParameters')).to.deep.equal(config.getViewParameters());
    });

  it('takes new view parameters and saves as lastViewParameters', function () {
    const config = createDummyConfiguration();
    const model = createModel(config);
    model.setViewParameters({
      lastWindowTimestamp: 1234,
    });

    expect(get(model, 'lastViewParameters')).to.deep.equal(config.getViewParameters())
      .and.to.include({ lastWindowTimestamp: 1234 });
  });

  it('contains promisified state in stateProxy', async function () {
    const model = createModel(createDummyConfiguration());

    await expectStateToHaveUpdatedPoints(model);
  });

  it('contains promisified state in stateProxy', async function () {
    const model = createModel(createDummyConfiguration());

    await expectStateToHaveUpdatedPoints(model);
  });

  it('updates state in stateProxy when configuration is in live mode', async function () {
    const model = createModel(createDummyConfiguration());
    model.setViewParameters({
      live: true,
    });

    const values1 = await expectStateToHaveUpdatedPoints(model);
    this.fakeClock.tick(61 * 1000);
    const values2 = await expectStateToHaveUpdatedPoints(model);

    expect(values1).to.not.deep.equal(values2);
  });

  it('stops updating state in stateProxy when configuration is in live mode but model was destroyed',
    async function () {
      const model = createModel(createDummyConfiguration());
      model.setViewParameters({
        live: true,
      });

      const values1 = await getStatePointsValues(model);
      model.destroy();
      await wait();
      this.fakeClock.tick(61 * 1000);
      const values2 = await getStatePointsValues(model);

      expect(values1).to.deep.equal(values2);
    });
});

async function expectStateToHaveUpdatedPoints(model) {
  const statePointsValues = await getStatePointsValues(model);
  const updatedValues = createDummySource()
    .fetchSeries({
      lastWindowTimestmap: get(model, 'configuration').getViewParameters().lastWindowTimestamp,
      timeResolution: 60,
      windowsCount: 60,
    }).mapBy('value');
  expect(statePointsValues).to.deep.equal(updatedValues);
  return updatedValues;
}

async function getStatePointsValues(model) {
  await get(model, 'stateProxy');
  return get(model, 'state').series[0].data.mapBy('value');
}
