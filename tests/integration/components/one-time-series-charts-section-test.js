import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll, settled } from '@ember/test-helpers';
import OneTooltipHelper from '../../helpers/one-tooltip';
import TestComponent from 'onedata-gui-common/components/test-component';
import { expectResolutions } from '../../helpers/one-time-series-chart';
import sinon from 'sinon';
import _ from 'lodash';
import { selectChoose } from 'ember-power-select/test-support/helpers';

function getEchartOption(chartIdx = 0) {
  return findAll('.test-component')[chartIdx].componentInstance.get('option');
}

const simpleChartDefinition = {
  yAxes: [{ id: 'axis' }],
  seriesBuilders: [{
    builderType: 'static',
    builderRecipe: {
      seriesTemplate: {
        id: 'valuesTotal',
        yAxisId: 'axis',
        dataProvider: {
          functionName: 'loadSeries',
          functionArguments: {
            sourceType: 'external',
            sourceSpecProvider: {
              functionName: 'literal',
              functionArguments: {
                data: {
                  externalSourceName: 'chartData',
                  externalSourceParameters: {
                    timeSeriesNameGenerator: 'values-total',
                    timeSeriesName: 'values-total',
                    metricNames: ['60', '3600'],
                  },
                },
              },
            },
          },
        },
      },
    },
  }],
};
const hourOnlySimpleChartDefinition = _.cloneDeep(simpleChartDefinition);
hourOnlySimpleChartDefinition.seriesBuilders[0].builderRecipe.seriesTemplate
  .dataProvider.functionArguments.sourceSpecProvider.functionArguments.data
  .externalSourceParameters.metricNames = ['3600'];

describe('Integration | Component | one time series charts section', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    this.owner.register('component:one-echart', TestComponent);

    const metrics = {
      60: { resolution: 60 },
      3600: { resolution: 3600 },
    };

    this.setProperties({
      onGetTimeSeriesSchemas: async () => [{
        nameGeneratorType: 'exact',
        nameGenerator: 'values-total',
        metrics,
      }, {
        nameGeneratorType: 'addPrefix',
        nameGenerator: 'values-id-',
        metrics,
      }],
      onQueryBatcherFetchDataCallback: sinon.spy(({ batchedQuery }) =>
        Object.keys(batchedQuery.layout).reduce((acc, seriesName) => {
          acc[seriesName] = batchedQuery.layout[seriesName].reduce((acc2, metricName) => {
            const resolution = Number(metricName);
            const timestamp = batchedQuery.startTimestamp -
              (batchedQuery.startTimestamp % resolution);
            acc2[metricName] = [{ timestamp, value: resolution * 10 }];
            return acc2;
          }, {});
          return acc;
        }, {})
      ),
      externalDataSources: { chartData: {}, chartData2: {} },
    });
  });

  afterEach(function () {
    this.get('fakeClock')?.restore();
  });

  it('renders empty section when no arguments were passed', async function () {
    this.setProperties({
      onGetTimeSeriesSchemas: null,
      onQueryBatcherFetchDataCallback: null,
      externalDataSources: null,
    });

    await renderComponent();

    expect(find('.one-time-series-charts-section')).to.exist;
    expect(find('.section-header')).to.not.exist;
    expect(find('.section-description')).to.not.exist;
    expect(find('.section-charts')).to.not.exist;
    expect(find('.section-subsections')).to.not.exist;
  });

  it('renders section title', async function () {
    const title = 'my title';
    useSectionSpec(this, {
      title: { content: title },
    });
    await renderComponent();

    expect(find('.section-title').textContent).to.equal(title);
  });

  it('renders section title tip', async function () {
    const tip = 'my tip';
    useSectionSpec(this, {
      title: { tip },
    });
    await renderComponent();

    const tooltipHelper = new OneTooltipHelper('.section-title-tip .one-icon');
    expect(await tooltipHelper.getText()).to.equal(tip);
  });

  it('renders section description', async function () {
    const description = 'my description';
    useSectionSpec(this, {
      description,
    });
    await renderComponent();

    expect(find('.section-description').textContent).to.equal(description);
  });

  ['independent', 'sharedWithinSection'].forEach((chartNavigation) => {
    it(`does not render charts shared navigation when "chartNavigation" is "${chartNavigation}" and there are no charts`,
      async function () {
        useSectionSpec(this, {
          chartNavigation,
        });
        await renderComponent();

        expect(find('.section-charts-shared-navigation')).to.not.exist;
      });
  });

  it('shows chart', async function () {
    useSectionSpec(this, {
      charts: [simpleChartDefinition],
    });
    await renderComponent();

    expect(findAll('.section-chart')).to.have.length(1);
    expect(getEchartOption().series[0].data.pop()[1]).to.equal(600);
  });

  it('detects possible resolutions for chart', async function () {
    useSectionSpec(this, {
      charts: [simpleChartDefinition],
    });
    await renderComponent();

    await expectResolutions(['1 min', '1 hr']);
  });

  it('batches requests across multiple charts using the same data source', async function () {
    this.set('fakeClock', sinon.useFakeTimers({
      now: Math.floor(Date.now() / 1000) * 1000,
      shouldAdvanceTime: true,
    }));
    useSectionSpec(this, {
      charts: [simpleChartDefinition, simpleChartDefinition],
    });
    await renderComponent();

    expect(findAll('.section-chart')).to.have.length(2);
    expect(this.get('onQueryBatcherFetchDataCallback')).to.have.been.calledOnce
      .and.to.have.been.calledWith({
        dataSourceName: 'chartData',
        batchedQuery: sinon.match({
          layout: {
            'values-total': ['60'],
          },
        }),
      });
  });

  it('shows two navigation toolbars when "chartNavigation" is "independent"', async function () {
    useSectionSpec(this, {
      chartNavigation: 'independent',
      charts: [simpleChartDefinition, simpleChartDefinition],
    });
    await renderComponent();

    expect(findAll('.one-time-series-chart-toolbar')).to.have.length(2);
  });

  it('changes resolution only for one chart at a time when "chartNavigation" is "independent"', async function () {
    useSectionSpec(this, {
      chartNavigation: 'independent',
      charts: [simpleChartDefinition, simpleChartDefinition],
    });
    await renderComponent();

    await selectChoose('.one-time-series-chart-toolbar', '1 hr');
    const resolutionTriggers = findAll('.time-resolutions-trigger');
    expect(resolutionTriggers[0].textContent).to.contain('1 hr');
    expect(resolutionTriggers[1].textContent).to.contain('1 min');
  });

  it('shows one navigation toolbar when "chartNavigation" is "sharedWithinSection"', async function () {
    useSectionSpec(this, {
      chartNavigation: 'sharedWithinSection',
      charts: [simpleChartDefinition, simpleChartDefinition],
    });
    await renderComponent();

    expect(findAll('.one-time-series-chart-toolbar')).to.have.length(1);
  });

  it('changes resolution for all charts in the same time when "chartNavigation" is "sharedWithinSection"',
    async function () {
      useSectionSpec(this, {
        chartNavigation: 'sharedWithinSection',
        charts: [simpleChartDefinition, simpleChartDefinition],
      });
      await renderComponent();

      await selectChoose('.one-time-series-chart-toolbar', '1 hr');
      expect(getEchartOption(0).series[0].data.pop()[1]).to.equal(36000);
      expect(getEchartOption(1).series[0].data.pop()[1]).to.equal(36000);
    });

  it('allows to use only common charts resolutions when "chartNavigation" is "sharedWithinSection"',
    async function () {
      useSectionSpec(this, {
        chartNavigation: 'sharedWithinSection',
        charts: [simpleChartDefinition, hourOnlySimpleChartDefinition],
      });
      await renderComponent();

      await expectResolutions(['1 hr']);
      expect(getEchartOption(0).series[0].data.pop()[1]).to.equal(36000);
      expect(getEchartOption(1).series[0].data.pop()[1]).to.equal(36000);
    });
});

async function renderComponent() {
  await render(hbs `{{one-time-series-charts-section
    sectionSpec=sectionSpec
    onGetTimeSeriesSchemas=onGetTimeSeriesSchemas
    externalDataSources=externalDataSources
    onQueryBatcherFetchData=onQueryBatcherFetchDataCallback
  }}`);
  await settled();
}

function useSectionSpec(testCase, spec) {
  testCase.set('sectionSpec', spec);
}
