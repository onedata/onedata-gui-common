import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createModelFromSpec } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

describe('Unit | Utility | atm-workflow/chart-dashboard-editor/model', function () {
  it('can be dumped to json format', function () {
    const model = createModelFromSpec(complicatedSpecExample);
    const modelJson = model.toJson();

    expect(modelJson).to.deep.equal(complicatedSpecExample);
  });
});

const complicatedSpecExample = {
  rootSection: {
    title: {
      content: 's1',
      tip: 's1tip',
    },
    description: 's1desc',
    chartNavigation: 'independent',
    sections: [{
      title: {
        content: 's1.1',
        tip: 's1.1tip',
      },
      description: 's1.1desc',
      chartNavigation: 'independent',
      sections: [],
      charts: [{
        title: {
          content: 'c1',
          tip: 'c1tip',
        },
        yAxes: [{
          id: 'a1id',
          name: 'a1',
          minInterval: 2,
          unitName: 'bytesPerSec',
          unitOptions: {
            format: 'iec',
          },
          valueProvider: {
            functionName: 'currentValue',
            functionArguments: {},
          },
        }, {
          id: 'a2id',
          name: 'a2',
          minInterval: 1,
          unitName: 'custom',
          unitOptions: {
            customName: 'some-name',
            useMetricSuffix: false,
          },
          valueProvider: {
            functionName: 'abs',
            functionArguments: {
              inputDataProvider: {
                functionName: 'currentValue',
                functionArguments: {},
              },
            },
          },
        }],
        seriesGroupBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'g1id',
              name: 'g1',
              stacked: true,
              showSum: true,
              subgroups: [{
                id: 'g1.1id',
                name: 'g1.1',
                stacked: false,
                showSum: false,
                subgroups: [],
              }],
            },
          },
        }],
        seriesBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesTemplate: {
              id: 's1id',
              type: 'line',
              name: 's1',
              groupId: 'g1id',
              yAxisId: 'a1id',
              color: '#ff0000',
              dataProvider: {
                functionName: 'abs',
                functionArguments: {
                  inputDataProvider: {
                    functionName: 'multiply',
                    functionArguments: {
                      operandProviders: [{
                        functionName: 'literal',
                        functionArguments: {
                          data: 10,
                        },
                      }, {
                        functionName: 'rate',
                        functionArguments: {
                          timeSpanProvider: {
                            functionName: 'literal',
                            functionArguments: {
                              data: 2,
                            },
                          },
                          inputDataProvider: {
                            functionName: 'timeDerivative',
                            functionArguments: {
                              timeSpanProvider: {
                                functionName: 'literal',
                                functionArguments: {
                                  data: 1,
                                },
                              },
                              inputDataProvider: {
                                functionName: 'replaceEmpty',
                                functionArguments: {
                                  inputDataProvider: {
                                    functionName: 'loadSeries',
                                    functionArguments: {
                                      sourceType: 'external',
                                      sourceSpecProvider: {
                                        functionName: 'literal',
                                        functionArguments: {
                                          data: {
                                            externalSourceName: 'store',
                                            externalSourceParameters: {
                                              collectionRef: 'ref1',
                                              timeSeriesNameGenerator: 'gen1',
                                              timeSeriesName: 'gen1',
                                              metricNames: ['m1', 'm2'],
                                            },
                                          },
                                        },
                                      },
                                      replaceEmptyParametersProvider: {
                                        functionName: 'literal',
                                        functionArguments: {
                                          data: {
                                            strategyProvider: {
                                              functionName: 'literal',
                                              functionArguments: {
                                                data: 'usePrevious',
                                              },
                                            },
                                            fallbackValueProvider: {
                                              functionName: 'literal',
                                              functionArguments: {
                                                data: 2,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                  strategyProvider: {
                                    functionName: 'literal',
                                    functionArguments: {
                                      data: 'useFallback',
                                    },
                                  },
                                  fallbackValueProvider: {
                                    functionName: 'literal',
                                    functionArguments: {
                                      data: 3,
                                    },
                                  },
                                },
                              },
                            },
                          },
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
                externalSourceName: 'store',
                externalSourceParameters: {
                  collectionRef: 'ref1',
                  timeSeriesNameGenerator: 'gen1',
                  metricNames: ['m3', 'm4'],
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
                  data: 'a2id',
                },
              },
              groupIdProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: 'g1.1id',
                },
              },
              colorProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: null,
                },
              },
              dataProvider: {
                functionName: 'loadSeries',
                functionArguments: {
                  sourceType: 'external',
                  sourceSpecProvider: {
                    functionName: 'getDynamicSeriesConfig',
                    functionArguments: {
                      propertyName: 'loadSeriesSourceSpec',
                    },
                  },
                  replaceEmptyParametersProvider: {
                    functionName: 'literal',
                    functionArguments: {
                      data: {
                        strategyProvider: {
                          functionName: 'literal',
                          functionArguments: {
                            data: 'usePrevious',
                          },
                        },
                        fallbackValueProvider: {
                          functionName: 'literal',
                          functionArguments: {
                            data: 2,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }],
      }],
    }],
    charts: [],
  },
};
