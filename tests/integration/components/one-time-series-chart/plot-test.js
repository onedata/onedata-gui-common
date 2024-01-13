import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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
import OneTooltipHelper from '../../../helpers/one-tooltip';

describe('Integration | Component | one-time-series-chart/plot', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    this.owner.register('component:one-echart', TestComponent);
    const now = Date.now();
    this.set('fakeClock', sinon.useFakeTimers({
      now: now - (now % (60000 * 60)) - 35 * 60000 - 35000,
      shouldAdvanceTime: true,
    }));
  });

  afterEach(function () {
    const {
      model,
      fakeClock,
    } = this.getProperties('model', 'fakeClock');
    if (model) {
      model.destroy();
    }
    fakeClock.restore();
  });

  it('has class "one-time-series-chart-plot"', async function () {
    await renderComponent();

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('one-time-series-chart-plot');
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

    await renderComponent();

    expectNoChartDataToShow();
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

    await renderComponent();

    expectNoChartDataToShow();
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

    await renderComponent();

    expectNoChartDataToShow();
  });

  it('shows chart title and title tip', async function () {
    setupModel(this, createDummyConfiguration());

    await renderComponent();

    expect(find('.title-content'))
      .to.contain.text(this.get('model.state.title.content'));
    expect(await new OneTooltipHelper('.title-area .one-label-tip .one-icon').getText())
      .to.equal(this.get('model.state.title.tip'));
  });

  it('does not show chart title area when title is not set', async function () {
    setupModel(this, {
      chartDefinition: {
        title: {
          // no `content` property. In that situation `tip` should be ignored
          tip: 'abcd',
        },
      },
    });

    await renderComponent();

    expect(find('.title-area')).to.not.exist;
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

    await renderComponent();
    model.setViewParameters({
      timeResolution: 3600,
    });
    await settled();

    expect(get(model, 'lastViewParameters.timeResolution')).to.equal(3600);
    expectEchartDummyPoints(null, 3600, 11);
  });

  it('shows continuously reloading newest data in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const model = setupModel(this, createDummyConfiguration());
    model.setViewParameters({
      live: true,
    });

    await renderComponent();
    expectEchartDummyPoints(null, 60, 60, true);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.be.null;

    fakeClock.tick(60 * 1000 + 500);
    await settled();
    expectEchartDummyPoints(null, 60, 60, true);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.be.null;
  });

  it('shows continuously reloading older data in live mode', async function () {
    const fakeClock = this.get('fakeClock');
    const model = setupModel(this, createDummyConfiguration());
    model.setViewParameters({
      live: true,
      lastPointTimestamp: 1000000,
    });

    await renderComponent();
    expectEchartDummyPoints(1000000, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.equal(1000000);

    fakeClock.tick(60 * 1000 + 500);
    await settled();
    expectEchartDummyPoints(1000000, 60, 60);
    expect(model.get('lastViewParameters.lastPointTimestamp')).to.equal(1000000);
  });
});

async function renderComponent() {
  await render(hbs `{{one-time-series-chart/plot model=model}}`);
}

function setupModel(testCase, configInitOptions) {
  return testCase.set('model', createModel(configInitOptions));
}
