import { expect } from 'chai';
import _ from 'lodash';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import Configuration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import Model from 'onedata-gui-common/utils/one-time-series-chart/model';
import { find } from '@ember/test-helpers';

export function expectEchartDummyPoints(
  lastPointTimestamp,
  timeResolution,
  pointsCount
) {
  const echartPoints = createDummySource().fetchSeries({
    lastPointTimestamp,
    timeResolution,
    pointsCount,
  }).map(({ timestamp, value }) => [String(timestamp), value]);
  expect(getEchartOption().series[0].data).to.deep.equal(echartPoints);
}

function getEchartOption() {
  return find('.test-component').componentInstance.get('option');
}

export function createDummyConfiguration(minTimestamp, maxTimestamp) {
  return new Configuration({
    chartDefinition: createDummyChartDefinition(),
    timeResolutionSpecs: [{
      timeResolution: 60,
      pointsCount: 60,
      updateInterval: 10,
    }],
    externalDataSources: {
      dummy: createDummySource(minTimestamp, maxTimestamp),
    },
  });
}

export function createDummyChartDefinition() {
  return {
    title: {
      content: 'example title',
      tip: 'example tip',
    },
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
      let lastTimestamp = context.lastPointTimestamp;
      if (!lastTimestamp) {
        lastTimestamp = Math.floor(Date.now() / 1000);
      }
      lastTimestamp = typeof maxTimestamp === 'number' ?
        Math.min(lastTimestamp, maxTimestamp) : lastTimestamp;
      lastTimestamp = lastTimestamp - lastTimestamp % context.timeResolution;
      const points = _.times(context.pointsCount, (idx) => {
        const timestamp = lastTimestamp -
          ((context.pointsCount) - idx - 1) * context.timeResolution;
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

export function expectNoChartDataToShow() {
  const plot = find('.one-time-series-chart-plot');
  const canvasArea = plot.querySelector('.canvas-area');
  expect(canvasArea.children).to.have.length(1);
  expect(plot).to.have.class('no-data');
  expect(canvasArea.textContent.trim()).to.equal('There is no data to show.');
}

export function createModel(config) {
  return Model.create({
    configuration: config instanceof Configuration ?
      config : new Configuration(config),
  });
}

export async function expectResolutions(resolutionLabels) {
  await clickTrigger('.one-time-series-chart-toolbar');
  const options = document.querySelectorAll('.ember-power-select-option');
  expect(options).to.have.length(resolutionLabels.length);
  resolutionLabels.forEach((label, idx) =>
    expect(options[idx].textContent.trim()).to.equal(label)
  );
}

export function expectActiveResolution(activeResolutionLabel) {
  const dropdownTrigger = find('.time-resolutions-trigger');
  expect(dropdownTrigger.textContent.trim()).to.equal(activeResolutionLabel);
}

export async function changeResolution(resolutionLabel) {
  await selectChoose('.time-resolutions-trigger', resolutionLabel);
}
