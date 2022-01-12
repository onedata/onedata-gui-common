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
            functionName: 'asBytes',
            functionArguments: {
              data: {
                functionName: 'abs',
                functionArguments: {
                  data: {
                    functionName: 'supplyValue',
                  },
                },
              },
            },
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
                functionName: 'abs',
                functionArguments: {
                  data: {
                    functionName: 'multiply',
                    functionArguments: {
                      operands: [{
                        functionName: 'loadSeries',
                        functionArguments: {
                          sourceType: 'external',
                          sourceParameters: {
                            externalSourceName: 'timeSeriesStoreContent',
                            externalSourceParameters: {
                              storeId: 'asdfasdf',
                              seriesId: 'bytes',
                            },
                          },
                        },
                      }, 2],
                    },
                  },
                },
              },
            },
          },
        }],
      },
      timeResolutionSpecs: [{
        timeResolution: 5,
        windowsCount: 24,
      }, {
        timeResolution: 60,
        windowsCount: 60,
      }, {
        timeResolution: 60 * 60,
        windowsCount: 24,
      }],
      externalDataSources: {
        timeSeriesStoreContent: {
          fetchData: (context) => {
            const nowTimestamp = Math.floor(Date.now() / 1000);
            return _.times(context.windowsCount, (idx) => ({
              timestamp: (context.lastWindowTimestamp || nowTimestamp) -
                (context.windowsCount - idx - 1) * context.timeResolution,
              value: (1024 + idx * 512) * 1024,
            }));
          },
        },
      },
    });

    return config;
  }),
});
