/**
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
          unitName: 'bytes',
          valueProvider: {
            functionName: 'abs',
            functionArguments: {
              inputDataProvider: {
                functionName: 'currentValue',
              },
            },
          },
        }],
        seriesGroupBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'group1',
              name: 'Group 1',
              stack: false,
              showSeriesSum: false,
            },
          },
        }, {
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesGroupConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'myTimeSeriesSource',
                externalSourceParameters: {
                  namePrefix: 'dynamic group #',
                },
              },
            },
            seriesGroupTemplate: {
              idProvider: {
                functionName: 'getDynamicSeriesGroupConfig',
                functionArguments: {
                  propertyName: 'id',
                },
              },
              nameProvider: {
                functionName: 'getDynamicSeriesGroupConfig',
                functionArguments: {
                  propertyName: 'name',
                },
              },
              stackedProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: true,
                },
              },
              showSumProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: true,
                },
              },
              subgroupsProvider: {
                functionName: 'getDynamicSeriesGroupConfig',
                functionArguments: {
                  propertyName: 'subgroups',
                },
              },
            },
          },
        }],
        seriesBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesTemplate: {
              id: 'series1id',
              name: 'Series 1',
              type: 'bar',
              yAxisId: 'axis1',
              groupId: 'group1',
              dataProvider: {
                functionName: 'abs',
                functionArguments: {
                  inputDataProvider: {
                    functionName: 'multiply',
                    functionArguments: {
                      operandProviders: [{
                        functionName: 'loadSeries',
                        functionArguments: {
                          sourceType: 'external',
                          sourceSpecProvider: {
                            functionName: 'literal',
                            functionArguments: {
                              data: {
                                externalSourceName: 'myTimeSeriesSource',
                                externalSourceParameters: {
                                  storeId: 'asdfasdf',
                                  seriesId: 'bytes',
                                },
                              },
                            },
                          },
                        },
                      }, {
                        functionName: 'literal',
                        functionArguments: {
                          data: 2,
                        },
                      }],
                    },
                  },
                },
              },
            },
          },
        }, {
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'myTimeSeriesSource',
                externalSourceParameters: {
                  namePrefix: 'dynamic series #',
                },
              },
            },
            seriesTemplate: {
              idProvider: {
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'id',
                },
              },
              nameProvider: {
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'name',
                },
              },
              typeProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: 'bar',
                },
              },
              yAxisIdProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: 'axis1',
                },
              },
              groupIdProvider: {
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'groupId',
                },
              },
              dataProvider: {
                functionName: 'abs',
                functionArguments: {
                  inputDataProvider: {
                    functionName: 'multiply',
                    functionArguments: {
                      operandProviders: [{
                        functionName: 'loadSeries',
                        functionArguments: {
                          sourceType: 'external',
                          sourceSpecProvider: {
                            functionName: 'getDynamicSeriesConfig',
                            functionArguments: {
                              propertyName: 'loadSeriesSourceParameters',
                            },
                          },
                        },
                      }, {
                        functionName: 'literal',
                        functionArguments: {
                          data: 2,
                        },
                      }],
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
