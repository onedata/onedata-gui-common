import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Configuration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import TestComponent from 'onedata-gui-common/components/test-component';
import sinon from 'sinon';
import {
  createDummyChartDefinition,
  createDummySource,
  expectEchartDummyPoints,
  createDummyConfiguration,
  expectNoChartDataToShow,
  expectResolutions,
  expectActiveResolution,
  changeResolution,
} from '../../helpers/one-time-series-chart';
import { render, settled, click, find } from '@ember/test-helpers';

describe('Integration | Component | one time series chart', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    this.owner.register('component:one-echart', TestComponent);
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
      chartDefinition: {
        yAxes: [{
          id: 'a1',
        }],
        series: [],
      },
      timeResolutionSpecs: [{
        timeResolution: 60,
      }],
    }));

    await renderComponent();

    expectNoChartDataToShow();
  });

  it('renders time resolutions according to the resolutions defined in configuration', async function () {
    this.set('configuration', new Configuration({
      chartDefinition: createDummyChartDefinition(),
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

    await renderComponent();

    await expectResolutions(['1 min', '1 hr', '2 days']);
    expectActiveResolution('1 min');
  });

  it('allows to change time resolution using dropdown', async function () {
    const config = this.set('configuration', new Configuration({
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
    }));

    await renderComponent();
    await changeResolution('1 hr');

    expectActiveResolution('1 hr');
    expect(config.getViewParameters().timeResolution).to.equal(3600);
    expectEchartDummyPoints(null, 3600, 11);
  });

  it('allows to change time resolution using config', async function () {
    const config = this.set('configuration', new Configuration({
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
    }));

    await renderComponent();
    config.setViewParameters({
      timeResolution: 3600,
    });
    await settled();

    expectActiveResolution('1 hr');
    expect(config.getViewParameters().timeResolution).to.equal(3600);
    expectEchartDummyPoints(null, 3600, 11);
  });

  it('allows to show older data', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      lastPointTimestamp: 1000000,
    });

    await renderComponent();
    const showOlderBtn = find('.show-older-btn');
    expect(showOlderBtn.disabled).to.be.false;
    await click(showOlderBtn);

    expect(showOlderBtn.disabled).to.be.false;
    expect(config.getViewParameters().lastPointTimestamp).to.equal(996360);
    expectEchartDummyPoints(996360, 60, 60);
  });

  it('allows to show newer data', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      lastPointTimestamp: 1000000,
    });

    await renderComponent();
    const showNewerBtn = find('.show-newer-btn');
    expect(showNewerBtn.disabled).to.be.false;
    await click(showNewerBtn);

    expect(showNewerBtn.disabled).to.be.false;
    expect(config.getViewParameters().lastPointTimestamp).to.equal(1003560);
    expectEchartDummyPoints(1003560, 60, 60);
  });

  it('allows to show the newest data', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      lastPointTimestamp: 1000000,
    });

    await renderComponent();
    const showNewestBtn = find('.show-newest-btn');
    expect(showNewestBtn.disabled).to.be.false;
    await click(showNewestBtn);

    expect(showNewestBtn.disabled).to.be.true;
    expect(find('.show-newer-btn').disabled).to.be.true;
    expect(config.getViewParameters().lastPointTimestamp)
      .to.be.closeTo(Math.floor(Date.now() / 1000), 60);
    expectEchartDummyPoints(config.getViewParameters().lastPointTimestamp, 60, 60);
  });

  it('moving to the newest data in live mode changes lastPointTimestamp to null', async function () {
    const config = this.set('configuration', createDummyConfiguration());
    config.setViewParameters({
      live: true,
      lastPointTimestamp: 1000000,
    });

    await renderComponent();
    await click('.show-newest-btn');
    expectEchartDummyPoints(null, 60, 60);
    expect(config.getViewParameters().lastPointTimestamp).to.be.null;
  });
});

async function renderComponent() {
  await render(hbs `{{one-time-series-chart configuration=configuration}}`);
}
