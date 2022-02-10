import { expect } from 'chai';
import _ from 'lodash';
import Configuration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import Model from 'onedata-gui-common/utils/one-time-series-chart/model';

export function expectEchartDummyPoints(
  testCase,
  lastWindowTimestamp,
  timeResolution,
  windowsCount
) {
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

export function createDummyConfiguration(minTimestamp, maxTimestamp) {
  return new Configuration({
    rawConfiguration: createDummyRawConfiguration(),
    timeResolutionSpecs: [{
      timeResolution: 60,
      windowsCount: 60,
      updateInterval: 10,
    }],
    externalDataSources: {
      dummy: createDummySource(minTimestamp, maxTimestamp),
    },
  });
}

export function createDummyRawConfiguration() {
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

export function createDummySource(minTimestamp, maxTimestamp) {
  return {
    fetchSeries: (context) => {
      let lastTimestamp = context.lastWindowTimestamp;
      if (!lastTimestamp) {
        lastTimestamp = Math.floor(Date.now() / 1000);
      }
      lastTimestamp = typeof maxTimestamp === 'number' ?
        Math.min(lastTimestamp, maxTimestamp) : lastTimestamp;
      lastTimestamp = lastTimestamp - lastTimestamp % context.timeResolution;
      const points = _.times(context.windowsCount, (idx) => {
        const timestamp = lastTimestamp -
          ((context.windowsCount) - idx - 1) * context.timeResolution;
        return {
          timestamp,
          value: timestamp % 123,
        };
      });
      return typeof minTimestamp === 'number' ?
        points.filter(({ timestamp }) => timestamp >= minTimestamp) :
        points;
    },
  };
}

export function expectNoChartDataToShow(testCase) {
  const $plot = testCase.$('.one-time-series-chart-plot');
  expect($plot.children()).to.have.length(1);
  expect($plot).to.have.class('no-data');
  expect($plot.text().trim()).to.equal('There is no data to show.');
}

export function createModel(config) {
  return Model.create({
    configuration: config instanceof Configuration ?
      config : new Configuration(config),
  });
}
