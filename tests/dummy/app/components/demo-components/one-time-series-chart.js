/**
 * @module components/demo-components/one-time-series-chart
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';
import OTSCConfiguration from 'onedata-gui-common/utils/one-time-series-chart/configuration';

export default Component.extend({
  configuration: computed(() => {
    const config = new OTSCConfiguration({
      chartDefinition: {
        title: 'Demo chart',
        yAxes: [{
          id: 'axis1',
          name: 'Axis 1',
          valueTransformer: {
            functionName: 'formatWithUnit',
            functionArguments: {
              unitName: 'bytes',
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
        seriesGroups: [{
          factoryName: 'static',
          factoryArguments: {
            seriesGroupTemplate: {
              id: 'group1',
              name: 'Group 1',
              stack: false,
              showSeriesSum: false,
            },
          },
        }, {
          factoryName: 'dynamic',
          factoryArguments: {
            dynamicSeriesGroupConfigsSource: {
              sourceType: 'external',
              sourceParameters: {
                externalSourceName: 'myTimeSeriesSource',
                externalSourceParameters: {
                  namePrefix: 'dynamic group #',
                },
              },
            },
            seriesGroupTemplate: {
              id: {
                functionName: 'getDynamicSeriesGroupConfigData',
                functionArguments: {
                  propertyName: 'id',
                },
              },
              name: {
                functionName: 'getDynamicSeriesGroupConfigData',
                functionArguments: {
                  propertyName: 'name',
                },
              },
              stack: true,
              showSeriesSum: true,
              subgroups: {
                functionName: 'getDynamicSeriesGroupConfigData',
                functionArguments: {
                  propertyName: 'subgroups',
                },
              },
            },
          },
        }],
        series: [{
          factoryName: 'static',
          factoryArguments: {
            seriesTemplate: {
              id: 'series1id',
              name: 'Series 1',
              type: 'bar',
              yAxisId: 'axis1',
              groupId: 'group1',
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
                            externalSourceName: 'myTimeSeriesSource',
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
        }, {
          factoryName: 'dynamic',
          factoryArguments: {
            dynamicSeriesConfigsSource: {
              sourceType: 'external',
              sourceParameters: {
                externalSourceName: 'myTimeSeriesSource',
                externalSourceParameters: {
                  namePrefix: 'dynamic series #',
                },
              },
            },
            seriesTemplate: {
              id: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'id',
                },
              },
              name: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'name',
                },
              },
              type: 'bar',
              yAxisId: 'axis1',
              groupId: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'groupId',
                },
              },
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
                            functionName: 'getDynamicSeriesConfigData',
                            functionArguments: {
                              propertyName: 'loadSeriesSourceParameters',
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
        pointsCount: 24,
        updateInterval: 5,
      }, {
        timeResolution: 60,
        pointsCount: 60,
        updateInterval: 10,
      }, {
        timeResolution: 60 * 60,
        pointsCount: 24,
        updateInterval: 30,
      }],
      externalDataSources: {
        myTimeSeriesSource: {
          fetchSeries: async (context) => {
            let lastTimestamp = context.lastPointTimestamp;
            if (!lastTimestamp) {
              lastTimestamp = Math.floor(Date.now() / 1000);
            }
            lastTimestamp = lastTimestamp - lastTimestamp % context.timeResolution;
            return _.times(context.pointsCount, (idx) => ({
              timestamp: lastTimestamp -
                ((context.pointsCount) - idx - 1) * context.timeResolution,
              value: (1024 + idx * 512) * 1024,
            }));
          },
          fetchDynamicSeriesGroupConfigs: ({ namePrefix }) => {
            return [{
              id: 'group2',
              name: namePrefix + '2',
              subgroups: [{
                id: 'group2.1',
                name: namePrefix + '2.1',
              }],
            }];
          },
          fetchDynamicSeriesConfigs: () => {
            return [{
              id: 'abcid',
              name: 'abc',
              groupId: 'group2',
              loadSeriesSourceParameters: {
                externalSourceName: 'myTimeSeriesSource',
                externalSourceParameters: {
                  storeId: 'asdfasdf',
                  seriesId: 'bytes',
                },
              },
            }, {
              id: 'defid',
              name: 'def',
              groupId: 'group2.1',
              loadSeriesSourceParameters: {
                externalSourceName: 'myTimeSeriesSource',
                externalSourceParameters: {
                  storeId: 'asdfasdf',
                  seriesId: 'bytes',
                },
              },
            }];
          },
        },
      },
    });

    config.setViewParameters({
      live: true,
    });

    return config;
  }),
});
