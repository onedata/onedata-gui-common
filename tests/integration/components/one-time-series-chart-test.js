import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import Configuration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import _ from 'lodash';
import TestComponent from 'onedata-gui-common/components/test-component';
import sinon from 'sinon';

describe('Integration | Component | one time series chart', function () {
  setupComponentTest('one-time-series-chart', {
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

  it('shows "no data to show" info, when there are no series to show', async function () {
    this.set('configuration', new Configuration({
      rawConfiguration: {
        yAxes: [{
          id: 'a1',
        }],
        series: [],
      },
      timeResolutionSpecs: [{
        timeResolution: 60,
      }],
    }));

    await render(this);

    expectNoDataToShow(this);
  });

  it('shows "no data to show" info, when there are no time resolutions specified', async function () {
    this.set('configuration', new Configuration({
      rawConfiguration: createDummyRawConfiguration(),
      timeResolutionSpecs: [],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    }));

    await render(this);

    expectNoDataToShow(this);
  });

  it('shows "no data to show" info, when there are no yAxes specified', async function () {
    const rawConfiguration = createDummyRawConfiguration();
    rawConfiguration.yAxes = [];
    this.set('configuration', new Configuration({
      rawConfiguration,
      timeResolutionSpecs: [{
        timeResolution: 60,
      }],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    }));

    await render(this);

    expectNoDataToShow(this);
  });

  it('renders time resolutions according to the resolutions defined in configuration', async function () {
    this.set('configuration', new Configuration({
      rawConfiguration: createDummyRawConfiguration(),
      timeResolutionSpecs: [{
        timeResolution: 60,
      }, {
        timeResolution: 3600,
      }, {
        timeResolution: 48 * 3600,
      }],
      externalDataSources: {
        dummy: {
          fetchSeries: () => [],
        },
      },
    }));

    await render(this);

    const $resolutions = this.$('.time-resolution-selector button');
    expect($resolutions).to.have.length(3);
    expect($resolutions.eq(0).text().trim()).to.equal('1 min');
    expect($resolutions.eq(1).text().trim()).to.equal('1 hr');
    expect($resolutions.eq(2).text().trim()).to.equal('2 days');
    expect($resolutions.eq(0)).to.have.class('active');
  });

  it('allows to change time resolution using button', async function () {
    const config = this.set('configuration', new Configuration({
      rawConfiguration: createDummyRawConfiguration(),
      timeResolutionSpecs: [{
        timeResolution: 60,
        windowsCount: 10,
      }, {
        timeResolution: 3600,
        windowsCount: 11,
      }, {
        timeResolution: 48 * 3600,
        windowsCount: 12,
      }],
      externalDataSources: {
        dummy: createDummySource(),
      },
    }));

    await render(this);
    const $resolutions = this.$('.time-resolution-selector button');
    await click($resolutions[1]);

    expect($resolutions.eq(1)).to.have.class('active');
    expect(config.getViewParameters().timeResolution).to.equal(3600);
    expectEchartPoints(this, null, 3600, 11);
  });

  it('allows to change time resolution using config', async function () {
    const config = this.set('configuration', new Configuration({
      rawConfiguration: createDummyRawConfiguration(),
      timeResolutionSpecs: [{
        timeResolution: 60,
        windowsCount: 10,
      }, {
        timeResolution: 3600,
        windowsCount: 11,
      }, {
        timeResolution: 48 * 3600,
        windowsCount: 12,
      }],
      externalDataSources: {
        dummy: createDummySource(),
      },
    }));

    await render(this);
    config.setViewParameters({
      timeResolution: 3600,
    });
    await wait();

    const $resolutions = this.$('.time-resolution-selector button');
    expect($resolutions.eq(1)).to.have.class('active');
    expect(config.getViewParameters().timeResolution).to.equal(3600);
    expectEchartPoints(this, null, 3600, 11);
  });

  it('allows to show older data', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      lastWindowTimestamp: 1000000,
    });

    await render(this);
    const $showOlderBtn = this.$('.show-older-btn');
    expect($showOlderBtn).to.be.not.disabled;
    await click($showOlderBtn[0]);

    expect($showOlderBtn).to.be.not.disabled;
    expect(config.getViewParameters().lastWindowTimestamp).to.equal(996360);
    expectEchartPoints(this, 996360, 60, 60);
  });

  it('allows to show newer data', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      lastWindowTimestamp: 1000000,
    });

    await render(this);
    const $showNewerBtn = this.$('.show-newer-btn');
    expect($showNewerBtn).to.be.not.disabled;
    await click($showNewerBtn[0]);

    expect($showNewerBtn).to.be.not.disabled;
    expect(config.getViewParameters().lastWindowTimestamp).to.equal(1003560);
    expectEchartPoints(this, 1003560, 60, 60);
  });

  it('allows to show the newest data', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      lastWindowTimestamp: 1000000,
    });

    await render(this);
    const $showNewestBtn = this.$('.show-newest-btn');
    expect($showNewestBtn).to.be.not.disabled;
    await click($showNewestBtn[0]);

    expect($showNewestBtn).to.be.disabled;
    expect(this.$('.show-newer-btn')).to.be.disabled;
    expect(config.getViewParameters().lastWindowTimestamp)
      .to.be.closeTo(Math.floor(Date.now() / 1000), 60);
    expectEchartPoints(this, null, 60, 60);
  });

  it('shows continuously reloading newest data in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      live: true,
    });

    await render(this);
    const $showNewestBtn = this.$('.show-newest-btn');
    expect($showNewestBtn).to.be.disabled;
    expectEchartPoints(this, null, 60, 60);
    expect(config.getViewParameters().lastWindowTimestamp).to.be.null;

    fakeClock.tick(60 * 1000 + 500);
    expect($showNewestBtn).to.be.disabled;
    expectEchartPoints(this, null, 60, 60);
    expect(config.getViewParameters().lastWindowTimestamp).to.be.null;
  });

  it('shows continuously reloading older data in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      live: true,
      lastWindowTimestamp: 1000000,
    });

    await render(this);
    expectEchartPoints(this, 1000000, 60, 60);
    expect(config.getViewParameters().lastWindowTimestamp).to.equal(1000000);

    fakeClock.tick(60 * 1000 + 500);
    expectEchartPoints(this, 1000000, 60, 60);
    expect(config.getViewParameters().lastWindowTimestamp).to.equal(1000000);
  });

  it('moving to the newest data in live mode changes lastWindowTimestamp to null', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      live: true,
      lastWindowTimestamp: 1000000,
    });

    await render(this);
    await click('.show-newest-btn');
    expectEchartPoints(this, null, 60, 60);
    expect(config.getViewParameters().lastWindowTimestamp).to.be.null;
  });
});

async function render(testCase) {
  testCase.render(hbs `{{one-time-series-chart configuration=configuration}}`);
  await wait();
}

function expectNoDataToShow(testCase) {
  expect(testCase.$('.one-time-series-chart > *')).to.have.length(1);
  expect(testCase.$('.one-time-series-chart')).to.have.class('no-data');
  expect(testCase.$().text().trim()).to.equal('There is no data to show.');
}

function expectEchartPoints(testCase, lastWindowTimestamp, timeResolution, windowsCount) {
  const echartPoints = createDummySource().fetchSeries({
    lastWindowTimestamp,
    timeResolution,
    windowsCount,
  }).map(({ timestamp, value }) => [String(timestamp), value]);
  expect(getEchartOption(testCase).series[0].data).to.deep.equal(echartPoints);
}

function getEchartOption(testCase) {
  return testCase.$('.test-component')[0].componentInstance.get('option');
}

function createDummyConfiguration() {
  return new Configuration({
    rawConfiguration: createDummyRawConfiguration(),
    timeResolutionSpecs: [{
      timeResolution: 60,
      windowsCount: 60,
      updateInterval: 10,
    }],
    externalDataSources: {
      dummy: createDummySource(),
    },
  });
}

function createDummyRawConfiguration() {
  return {
    yAxes: [{
      id: 'a1',
      name: 'Axis 1',
    }],
    series: [{
      factoryName: 'static',
      factoryArguments: {
        seriesTemplate: {
          id: 's1',
          name: 'Series 1',
          type: 'bar',
          yAxisId: 'a1',
          data: {
            functionName: 'loadSeries',
            functionArguments: {
              sourceType: 'external',
              sourceParameters: {
                externalSourceName: 'dummy',
              },
            },
          },
        },
      },
    }],
  };
}

function createDummySource() {
  return {
    fetchSeries: (context) => {
      let lastTimestamp = context.lastWindowTimestamp;
      if (!lastTimestamp) {
        lastTimestamp = Math.floor(Date.now() / 1000);
      }
      lastTimestamp = lastTimestamp - lastTimestamp % context.timeResolution;
      return _.times(context.windowsCount, (idx) => {
        const timestamp = lastTimestamp -
          ((context.windowsCount) - idx - 1) * context.timeResolution;
        return {
          timestamp,
          value: timestamp % 123,
        };
      });
    },
  };
}
