import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { find, findAll } from 'ember-native-dom-helpers';
import OneTooltipHelper from '../../helpers/one-tooltip';
import TestComponent from 'onedata-gui-common/components/test-component';
import { expectResolutions } from '../../helpers/one-time-series-chart';
import sinon from 'sinon';
import _ from 'lodash';
import { selectChoose } from '../../helpers/ember-power-select';

function getEchartOption(chartIdx = 0) {
  return findAll('.test-component')[chartIdx].componentInstance.get('option');
}

const simpleChartDefinition = {
  yAxes: [{ id: 'axis' }],
  seriesBuilders: [{
    builderName: 'static',
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
                    metricIds: ['60', '3600'],
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
  .externalSourceParameters.metricIds = ['3600'];

describe('Integration | Component | one time series charts section', function () {
  setupComponentTest('one-time-series-charts-section', {
    integration: true,
  });

  beforeEach(function () {
    this.register('component:one-echart', TestComponent);

    const metrics = {
      60: { resolution: 60 },
      3600: { resolution: 3600 },
    };

    this.setProperties({
      timeSeriesSchemas: [{
        nameGeneratorType: 'exact',
        nameGenerator: 'values-total',
        metrics,
      }, {
        nameGeneratorType: 'addPrefix',
        nameGenerator: 'values-id-',
        metrics,
      }],
      onQueryBatcherFetchDataCallback: sinon.spy(({ batchedQuery }) =>
        Object.keys(batchedQuery.metrics).reduce((acc, seriesId) => {
          acc[seriesId] = batchedQuery.metrics[seriesId].reduce((acc2, metricId) => {
            const resolution = Number(metricId);
            const timestamp = batchedQuery.startTimestamp -
              (batchedQuery.startTimestamp % resolution);
            acc2[metricId] = [{ timestamp, value: resolution * 10 }];
            return acc2;
          }, {});
          return acc;
        }, {})
      ),
      externalDataSources: { chartData: {}, chartData2: {} },
    });
  });

  it('renders empty section when no arguments were passed', async function () {
    this.setProperties({
      timeSeriesSchemas: null,
      onQueryBatcherFetchDataCallback: null,
      externalDataSources: null,
    });

    await renderComponent(this);

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
    await renderComponent(this);

    expect(find('.section-title').textContent).to.equal(title);
  });

  it('renders section title tip', async function () {
    const tip = 'my tip';
    useSectionSpec(this, {
      title: { tip },
    });
    await renderComponent(this);

    const tooltipHelper = new OneTooltipHelper('.section-title-tip .one-icon');
    expect(await tooltipHelper.getText()).to.equal(tip);
  });

  it('renders section description', async function () {
    const description = 'my description';
    useSectionSpec(this, {
      description,
    });
    await renderComponent(this);

    expect(find('.section-description').textContent).to.equal(description);
  });

  ['independent', 'sharedWithinSection'].forEach((chartNavigation) => {
    it(`does not render charts shared navigation when "chartNavigation" is "${chartNavigation}" and there are no charts`,
      async function () {
        useSectionSpec(this, {
          chartNavigation,
        });
        await renderComponent(this);

        expect(find('.section-charts-shared-navigation')).to.not.exist;
      });
  });

  it('shows chart', async function () {
    useSectionSpec(this, {
      charts: [simpleChartDefinition],
    });
    await renderComponent(this);

    expect(findAll('.section-chart')).to.have.length(1);
    expect(getEchartOption().series[0].data.pop()[1]).to.equal(600);
  });

  it('detects possible resolutions for chart', async function () {
    useSectionSpec(this, {
      charts: [simpleChartDefinition],
    });
    await renderComponent(this);

    await expectResolutions(['1 min', '1 hr']);
  });

  it('batches requests across multiple charts using the same data source', async function () {
    useSectionSpec(this, {
      charts: [simpleChartDefinition, simpleChartDefinition],
    });
    await renderComponent(this);

    expect(findAll('.section-chart')).to.have.length(2);
    expect(this.get('onQueryBatcherFetchDataCallback')).to.have.been.calledOnce
      .and.to.have.been.calledWith({
        dataSourceName: 'chartData',
        batchedQuery: sinon.match({
          metrics: {
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
    await renderComponent(this);

    expect(findAll('.one-time-series-chart-toolbar')).to.have.length(2);
  });

  it('changes resolution only for one chart at a time when "chartNavigation" is "independent"', async function () {
    useSectionSpec(this, {
      chartNavigation: 'independent',
      charts: [simpleChartDefinition, simpleChartDefinition],
    });
    await renderComponent(this);

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
    await renderComponent(this);

    expect(findAll('.one-time-series-chart-toolbar')).to.have.length(1);
  });

  it('changes resolution for all charts in the same time when "chartNavigation" is "sharedWithinSection"',
    async function () {
      useSectionSpec(this, {
        chartNavigation: 'sharedWithinSection',
        charts: [simpleChartDefinition, simpleChartDefinition],
      });
      await renderComponent(this);

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
      await renderComponent(this);

      await expectResolutions(['1 hr']);
      expect(getEchartOption(0).series[0].data.pop()[1]).to.equal(36000);
      expect(getEchartOption(1).series[0].data.pop()[1]).to.equal(36000);
    });
});

async function renderComponent(testCase) {
  testCase.render(hbs `{{one-time-series-charts-section
    sectionSpec=sectionSpec
    timeSeriesSchemas=timeSeriesSchemas
    externalDataSources=externalDataSources
    onQueryBatcherFetchData=onQueryBatcherFetchDataCallback
  }}`);
  await wait();
}

function useSectionSpec(testCase, spec) {
  testCase.set('sectionSpec', spec);
}
