/**
 * @module components/demo-components/one-histogram
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';
import OneHistogramConfiguration from 'onedata-gui-common/utils/one-histogram/configuration';

export default Component.extend({
  configuration: computed(() => {
    const config = new OneHistogramConfiguration({
      rawConfiguration: {
        id: 'demoChart',
        title: 'Demo chart',
        yAxes: [{
          id: 'axis1',
          name: 'Axis 1',
          valueFormatter: {
            functionName: 'asPercent',
          },
        }],
        series: [{
          factoryName: 'static',
          factoryArguments: {
            seriesTemplate: {
              id: 'series1',
              name: 'Series 1',
              type: 'bar',
              yAxisId: 'axis1',
              data: {
                functionName: 'multiply',
                functionArguments: {
                  operands: [{
                    functionName: 'loadSeries',
                    functionArguments: {
                      sourceType: 'external',
                      sourceParameters: {
                        externalSourceName: 'customSource',
                        externalSourceParameters: {
                          seriesId: 'series1',
                        },
                      },
                    },
                  }, {
                    functionName: 'loadSeries',
                    functionArguments: {
                      sourceType: 'constValue',
                      sourceParameters: {
                        value: 2,
                      },
                    },
                  }],
                },
              },
            },
          },
        }],
      },
      externalDataSources: {
        customSource: {
          fetchData: (context) => {
            const pointsCount = context.endTimestamp - context.startTimestamp + 1;
            return _.times(pointsCount, (idx) => ({
              timestamp: context.startTimestamp + idx,
              value: 0.1 + idx * (0.9 / pointsCount),
            }));
          },
        },
      },
    });
    config.setViewParameters({
      startTimestamp: 1641302596,
      endTimestamp: 1641302598,
    });
    return config;
  }),
});
