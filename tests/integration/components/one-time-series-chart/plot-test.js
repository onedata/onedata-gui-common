import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import TestComponent from 'onedata-gui-common/components/test-component';
import sinon from 'sinon';
import {
  createDummyChartDefinition,
  createDummySource,
  expectEchartDummyPoints,
  createDummyConfiguration,
  expectNoChartDataToShow,
  createModel,
} from '../../../helpers/one-time-series-chart';
import { get } from '@ember/object';

describe('Integration | Component | one time series chart/plot', function () {
  setupComponentTest('one-time-series-chart/plot', {
    integration: true,
  });

  beforeEach(function () {
    this.register('component:one-echart', TestComponent);
    this.set('fakeClock', sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    }));
  });

  afterEach(function () {
    this.get('fakeClock').restore();
  });

  it('has class "one-time-series-chart-plot"', async function () {
    await render(this);

    expect(this.$().children()).to.have.class('one-time-series-chart-plot')
      .and.to.have.length(1);
  });

  it('shows "no data to show" info, when there are no series to show', async function () {
    setupModel(this, {
      chartDefinition: {
        yAxes: [{
          id: 'a1',
        }],
        series: [],
      },
      timeResolutionSpecs: [{
        timeResolution: 60,
      }],
    });

    await render(this);

    expectNoChartDataToShow(this);
  });

  it('shows "no data to show" info, when there are no time resolutions specified', async function () {
    setupModel(this, {
      chartDefinition: createDummyChartDefinition(),
      timeResolutionSpecs: [],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    });

    await render(this);

    expectNoChartDataToShow(this);
  });

  it('shows "no data to show" info, when there are no yAxes specified', async function () {
    const chartDefinition = createDummyChartDefinition();
    chartDefinition.yAxes = [];
    setupModel(this, {
      chartDefinition,
      timeResolutionSpecs: [{
        timeResolution: 60,
      }],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    });

    await render(this);

    expectNoChartDataToShow(this);
  });

  it('rerenders chart after model config change', async function () {
    const model = setupModel(this, {
      chartDefinition: createDummyChartDefinition(),
      timeResolutionSpecs: [{
        timeResolution: 60,
        pointsCount: 10,
      }, {
        timeResolution: 3600,
        pointsCount: 11,
      }, {
        timeResolution: 48 * 3600,
        pointsCount: 12,
      }],
      externalDataSources: {
        dummy: createDummySource(),
      },
    });

    await render(this);
    model.setViewParameters({
      timeResolution: 3600,
    });
    await wait();

    expect(get(model, 'lastViewParameters.timeResolution')).to.equal(3600);
    expectEchartDummyPoints(this, null, 3600, 11);
  });

  it('rerenders chart in a loop in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const model = setupModel(this, createDummyConfiguration());
    model.setViewParameters({
      live: true,
    });

    await render(this);

    expectEchartDummyPoints(this, null, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.be.null;

    fakeClock.tick(60 * 1000 + 500);
    expectEchartDummyPoints(this, null, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.be.null;
  });

  it('shows continuously reloading newest data in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const model = setupModel(this, createDummyConfiguration());
    model.setViewParameters({
      live: true,
    });

    await render(this);
    expectEchartDummyPoints(this, null, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.be.null;

    fakeClock.tick(60 * 1000 + 500);
    expectEchartDummyPoints(this, null, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.be.null;
  });

  it('shows continuously reloading older data in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const model = setupModel(this, createDummyConfiguration());
    model.setViewParameters({
      live: true,
      lastPointTimestamp: 1000000,
    });

    await render(this);
    expectEchartDummyPoints(this, 1000000, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.equal(1000000);

    fakeClock.tick(60 * 1000 + 500);
    expectEchartDummyPoints(this, 1000000, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.equal(1000000);
  });
});

async function render(testCase) {
  testCase.render(hbs `{{one-time-series-chart/plot model=model}}`);
  await wait();
}

function setupModel(testCase, configInitOptions) {
  return testCase.set('model', createModel(configInitOptions));
}
