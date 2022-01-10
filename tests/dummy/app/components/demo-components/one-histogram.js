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
      externalDataSources: {
        timeSeriesStoreContent: {
          fetchData: (context) => {
            const pointsCount = context.endTimestamp - context.startTimestamp + 1;
            return _.times(pointsCount, (idx) => ({
              timestamp: context.startTimestamp + idx,
              value: (1024 + idx * 512) * 1024,
            }));
          },
          reloadTime: {
            hour: 1000,
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
