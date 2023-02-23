import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
  context,
} from 'mocha';
import sinon from 'sinon';
import Configuration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
import { run } from '@ember/runloop';
import moment from 'moment';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | one-time-series-chart/configuration', function () {
  beforeEach(function () {
    this.fakeClock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: false,
    });
  });

  afterEach(function () {
    this.fakeClock.restore();
  });

  it('calls state change handlers after "setViewParameters" call', function () {
    const config = new Configuration({});
    const handler1 = sinon.spy();
    const handler2 = sinon.spy();
    config.registerStateChangeHandler(handler1);
    config.registerStateChangeHandler(handler2);
    expect(handler1).to.be.not.called;
    expect(handler2).to.be.not.called;

    config.setViewParameters({});

    expect(handler1).to.be.calledOnce.and.to.be.calledWith(config);
    expect(handler2).to.be.calledOnce.and.to.be.calledWith(config);
  });

  it('allows to deregister state change handlers', function () {
    const config = new Configuration({});
    const handler1 = sinon.spy();
    const handler2 = sinon.spy();
    config.registerStateChangeHandler(handler1);
    config.registerStateChangeHandler(handler2);
    config.deregisterStateChangeHandler(handler1);

    config.setViewParameters({});

    expect(handler1).to.be.not.called;
    expect(handler2).to.be.calledOnce;
  });

  it('calls state change handlers repeatedly due to chart updates in live mode', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        updateInterval: 0.5,
      }],
    });
    config.setViewParameters({ live: true, timeResolution: 1 });
    const handler = sinon.spy();
    config.registerStateChangeHandler(handler);

    expect(handler).to.be.not.called;
    for (let i = 1; i <= 5; i++) {
      this.fakeClock.tick(520);
      await settled();
      expect(handler).to.have.callCount(i);
    }
  });

  it('changes frequency of calling state change handlers in live mode after chaging time resolution',
    async function () {
      const config = new Configuration({
        timeResolutionSpecs: [{
          timeResolution: 1,
          updateInterval: 0.5,
        }, {
          timeResolution: 2,
          updateInterval: 1,
        }],
      });
      config.setViewParameters({ live: true, timeResolution: 1 });
      const handler = sinon.spy();
      config.registerStateChangeHandler(handler);

      this.fakeClock.tick(520);
      await settled();
      expect(handler).to.be.calledOnce;
      config.setViewParameters({ timeResolution: 2 });
      expect(handler).to.be.calledTwice;
      this.fakeClock.tick(520);
      await settled();
      expect(handler).to.be.calledTwice;
      this.fakeClock.tick(520);
      await settled();
      expect(handler).to.be.calledThrice;

      for (let i = 1; i <= 5; i++) {
        this.fakeClock.tick(1020);
        await settled();
        expect(handler).to.have.callCount(i + 3);
      }
    });

  it('does not call state change handlers repeatedly when live mode is off', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        updateInterval: 0.5,
      }],
    });
    config.setViewParameters({ live: true, timeResolution: 1 });
    const handler = sinon.spy();
    config.registerStateChangeHandler(handler);

    this.fakeClock.tick(520);
    await settled();
    expect(handler).to.be.calledOnce;
    config.setViewParameters({ live: false });
    expect(handler).to.be.calledTwice;
    this.fakeClock.tick(2000);
    await settled();
    expect(handler).to.be.calledTwice;
  });

  it('does not call state change handlers in live mode after destroy', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        updateInterval: 0.5,
      }],
    });
    config.setViewParameters({ live: true, timeResolution: 1 });
    const handler = sinon.spy();
    config.registerStateChangeHandler(handler);

    this.fakeClock.tick(520);
    await settled();
    expect(handler).to.be.calledOnce;
    // We need to use `run`, because Looper uses Ember runloop functions - in
    // this case it is `cancel`, which throws an error.
    run(() => config.destroy());
    expect(handler).to.be.calledOnce;
    this.fakeClock.tick(2000);
    await settled();
    expect(handler).to.be.calledOnce;
  });

  it('calculates state with no title', async function () {
    const config = new Configuration({
      chartDefinition: {},
    });

    const state = await config.getState();

    expect(state.title).to.deep.equal({ content: '', tip: '' });
  });

  it('calculates state with title', async function () {
    const config = new Configuration({
      chartDefinition: {
        title: {
          content: 'abc',
        },
      },
    });

    const state = await config.getState();

    expect(state.title).to.deep.equal({ content: 'abc', tip: '' });
  });

  it('calculates state with title and title tip', async function () {
    const config = new Configuration({
      chartDefinition: {
        title: {
          content: 'abc',
          tip: 'someTip',
        },
      },
    });

    const state = await config.getState();

    expect(state.title).to.deep.equal({ content: 'abc', tip: 'someTip' });
  });

  it('calculates state with a default time resolution spec (first one)', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        pointsCount: 10,
        updateInterval: 0.5,
      }, {
        timeResolution: 2,
        pointsCount: 5,
        updateInterval: 1,
      }],
    });

    const state = await config.getState();

    expect(state.timeResolution).to.equal(1);
    expect(state.pointsCount).to.equal(10);
  });

  it('calculates state with changed time resolution spec', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        pointsCount: 10,
        updateInterval: 0.5,
      }, {
        timeResolution: 2,
        pointsCount: 5,
        updateInterval: 1,
      }],
    });

    config.setViewParameters({ timeResolution: 2 });
    const state = await config.getState();

    expect(state.timeResolution).to.equal(2);
    expect(state.pointsCount).to.equal(5);
  });

  it('calculates state with previous time resolution spec (first one) when changed spec was incorrect',
    async function () {
      const config = new Configuration({
        timeResolutionSpecs: [{
          timeResolution: 1,
          pointsCount: 10,
          updateInterval: 0.5,
        }, {
          timeResolution: 2,
          pointsCount: 5,
          updateInterval: 1,
        }],
      });

      config.setViewParameters({ timeResolution: 2 });
      config.setViewParameters({ timeResolution: 20 });
      const state = await config.getState();

      expect(state.timeResolution).to.equal(2);
      expect(state.pointsCount).to.equal(5);
    });

  it('calculates y axes state without custom value formatters', async function () {
    const config = new Configuration({
      chartDefinition: {
        yAxes: [{
          id: 'a1',
          name: 'axis1',
          minInterval: 1,
        }, {
          id: 'a2',
          name: 'axis2',
        }],
      },
    });

    const state = await config.getState();

    expect(asPlainJson(state.yAxes)).to.deep.equal([{
      id: 'a1',
      name: 'axis1',
      minInterval: 1,
    }, {
      id: 'a2',
      name: 'axis2',
      minInterval: null,
    }]);
    expect(state.yAxes[0].valueFormatter(123)).to.equal('123');
    expect(state.yAxes[1].valueFormatter(123)).to.equal('123');
  });

  it('calculates y axis state with custom value provider', async function () {
    const config = new Configuration({
      chartDefinition: {
        yAxes: [{
          id: 'a1',
          name: 'axis1',
          minInterval: 1,
          valueProvider: {
            functionName: 'abs',
            functionArguments: {
              inputDataProvider: {
                functionName: 'multiply',
                functionArguments: {
                  operandProviders: [{
                    functionName: 'currentValue',
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
        }, {
          id: 'a2',
          name: 'axis2',
          valueProvider: {
            functionName: 'currentValue',
          },
        }],
      },
    });

    const state = await config.getState();

    expect(asPlainJson(state.yAxes)).to.deep.equal([{
      id: 'a1',
      name: 'axis1',
      minInterval: 1,
    }, {
      id: 'a2',
      name: 'axis2',
      minInterval: null,
    }]);
    expect(state.yAxes[0].valueFormatter(-123)).to.equal('246');
    expect(state.yAxes[1].valueFormatter(-123)).to.equal('-123');
  });

  it('calculates y axis state with custom unit', async function () {
    const config = new Configuration({
      chartDefinition: {
        yAxes: [{
          id: 'a1',
          name: 'axis1',
          unitName: 'bytes',
          unitOptions: {
            format: 'si',
          },
        }],
      },
    });

    const state = await config.getState();

    expect(asPlainJson(state.yAxes)).to.deep.equal([{
      id: 'a1',
      name: 'axis1',
      minInterval: null,
    }]);
    expect(state.yAxes[0].valueFormatter(1000)).to.equal('1 kB');
  });

  it('calculates y axis state with both custom unit and value provider', async function () {
    const config = new Configuration({
      chartDefinition: {
        yAxes: [{
          id: 'a1',
          name: 'axis1',
          unitName: 'bytes',
          unitOptions: {
            format: 'si',
          },
          valueProvider: {
            functionName: 'abs',
            functionArguments: {
              inputDataProvider: {
                functionName: 'currentValue',
              },
            },
          },
        }],
      },
    });

    const state = await config.getState();

    expect(asPlainJson(state.yAxes)).to.deep.equal([{
      id: 'a1',
      name: 'axis1',
      minInterval: null,
    }]);
    expect(state.yAxes[0].valueFormatter(-1000)).to.equal('1 kB');
  });

  it('calculates x axis state', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 5,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
      },
    });

    const state = await config.getState();

    expect(asPlainJson(state.xAxis)).to.deep.equal({
      timestamps: [12, 14, 16, 18, 20],
    });
  });

  it('calculates formatter for x axis values, that deals with different resolutions', async function () {
    const timestamp = 1642681925;
    const timestampMoment = moment.unix(timestamp);
    const resolutionsToCheck = [
      ...[1, 59].map((timeResolution) => ({
        timeResolution,
        formattedTimestamp: timestampMoment.format('H:mm:ss[\n]DD/MM/YYYY'),
      })),
      ...[60, 3600, 12 * 3600, 24 * 3600 + 5].map((timeResolution) => ({
        timeResolution,
        formattedTimestamp: timestampMoment.format('H:mm[\n]DD/MM/YYYY'),
      })),
      ...[24 * 3600, 7 * 24 * 3600].map((timeResolution) => ({
        timeResolution,
        formattedTimestamp: timestampMoment.format('DD/MM/YYYY'),
      })),
    ];

    const config = new Configuration({
      timeResolutionSpecs: resolutionsToCheck.map(({ timeResolution }) => ({
        timeResolution,
      })),
    });

    for (const { timeResolution, formattedTimestamp } of resolutionsToCheck) {
      config.setViewParameters({ timeResolution });
      const state = await config.getState();
      expect(state.xAxis.timestampFormatter(timestamp)).to.equal(formattedTimestamp);
    }
  });

  it('calculates empty series groups state when there are no series groups defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroups: [],
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([]);
  });

  it('calculates series groups state using static factory', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [dummyStaticSeriesGroupFactory(1)],
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([dummyStaticSeriesGroupFactoryState(1)]);
  });

  it('calculates series groups state using dynamic factory (multiple scenario)', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [{
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesGroupConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'dummyDynamic',
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
                functionName: 'literal',
                functionArguments: {
                  data: 'group1',
                },
              },
            },
          },
        }],
      },
      externalDataSources: {
        dummyDynamic: {
          fetchDynamicSeriesGroupConfigs: () => [{ id: 'g1' }, { id: 'g2' }],
        },
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal(['g1', 'g2'].map((id) => ({
      id,
      name: 'group1',
      stacked: false,
      showSum: false,
      subgroups: [],
    })));
  });

  it('calculates series groups state using dynamic factory (empty scenario)', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [{
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesGroupsConfigs: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'dummyDynamic',
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
                functionName: 'literal',
                functionArguments: {
                  data: 'group1',
                },
              },
            },
          },
        }],
      },
      externalDataSources: {
        dummyDynamic: {
          fetchDynamicSeriesGroupConfigs: () => [],
        },
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([]);
  });

  it('calculates series groups state when all group fields are defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'g1',
              name: 'group1',
              stacked: true,
              showSum: true,
              subgroups: [{
                id: 'g11',
                name: 'group11',
                stacked: false,
                showSum: true,
                subgroups: [],
              }],
            },
          },
        }],
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([{
      id: 'g1',
      name: 'group1',
      stacked: true,
      showSum: true,
      subgroups: [{
        id: 'g11',
        name: 'group11',
        stacked: false,
        showSum: true,
        subgroups: [],
      }],
    }]);
  });

  it('calculates series groups state when optional group fields are not defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'g1',
            },
          },
        }],
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([{
      id: 'g1',
      name: '',
      stacked: false,
      showSum: false,
      subgroups: [],
    }]);
  });

  it('calculates series groups state when subgroup optional fields are not defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'g1',
              name: 'group1',
              stacked: true,
              showSum: true,
              subgroups: [{
                id: 'g11',
              }],
            },
          },
        }],
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([{
      id: 'g1',
      name: 'group1',
      stacked: true,
      showSum: true,
      subgroups: [{
        id: 'g11',
        name: '',
        stacked: false,
        showSum: false,
        subgroups: [],
      }],
    }]);
  });

  it('calculates series group state when all possible series fields are functions', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesGroupBuilders: [{
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesGroupConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'dummyDynamic',
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
                functionName: 'getDynamicSeriesGroupConfig',
                functionArguments: {
                  propertyName: 'stacked',
                },
              },
              showSumProvider: {
                functionName: 'getDynamicSeriesGroupConfig',
                functionArguments: {
                  propertyName: 'showSum',
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
      },
      externalDataSources: {
        dummyDynamic: {
          fetchDynamicSeriesGroupConfigs: () => {
            return [{
              id: 'g1',
              name: 'group1',
              stacked: true,
              showSum: true,
              subgroups: [{
                id: 'g11',
                name: 'group11',
                stacked: false,
                showSum: true,
                subgroups: [],
              }],
            }];
          },
        },
      },
    });

    const state = await config.getState();

    expect(state.seriesGroups).to.deep.equal([{
      id: 'g1',
      name: 'group1',
      stacked: true,
      showSum: true,
      subgroups: [{
        id: 'g11',
        name: 'group11',
        stacked: false,
        showSum: true,
        subgroups: [],
      }],
    }]);
  });

  it('calculates empty series state when there are no series defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 5,
      }],
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([]);
  });

  it('calculates series state using static factory', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([{
      id: 's1',
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: null,
      groupId: null,
      data: [
        new Point(18, null, { pointDuration: 2, oldest: true, fake: true }),
        new Point(20, 2, { pointDuration: 2, oldest: true, newest: true }),
      ],
    }]);
  });

  it('calculates series state using dynamic factory (multiple scenario)', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [{
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'dummyDynamic',
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
                functionName: 'literal',
                functionArguments: {
                  data: 'series1',
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
                  data: 'a1',
                },
              },
              dataProvider: {
                functionName: 'loadSeries',
                functionArguments: {
                  sourceType: 'external',
                  sourceSpecProvider: {
                    functionName: 'literal',
                    functionArguments: {
                      data: {
                        externalSourceName: 'dummy',
                      },
                    },
                  },
                },
              },
            },
          },
        }],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
        dummyDynamic: {
          fetchDynamicSeriesConfigs: () => [{ id: 's1' }, { id: 's2' }],
        },
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal(['s1', 's2'].map((id) => ({
      id,
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: null,
      groupId: null,
      data: [
        new Point(18, null, { pointDuration: 2, oldest: true, fake: true }),
        new Point(20, 2, { pointDuration: 2, oldest: true, newest: true }),
      ],
    })));
  });

  it('calculates series state using dynamic factory (empty scenario)', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [{
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'dummyDynamic',
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
                functionName: 'literal',
                functionArguments: {
                  data: 'series1',
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
                  data: 'a1',
                },
              },
              dataProvider: {
                functionName: 'loadSeries',
                functionArguments: {
                  sourceType: 'external',
                  sourceSpecProvider: {
                    functionName: 'literal',
                    functionArguments: {
                      data: {
                        externalSourceName: 'dummy',
                      },
                    },
                  },
                },
              },
            },
          },
        }],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
        dummyDynamic: {
          fetchDynamicSeriesConfigs: () => [],
        },
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([]);
  });

  it('calculates series state when all series fields are defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesTemplate: {
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
              color: '#ff0000',
              groupId: 'stack1',
              dataProvider: {
                functionName: 'loadSeries',
                functionArguments: {
                  sourceType: 'external',
                  sourceSpecProvider: {
                    functionName: 'literal',
                    functionArguments: {
                      data: {
                        externalSourceName: 'dummy',
                      },
                    },
                  },
                },
              },
            },
          },
        }],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([{
      id: 's1',
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: '#ff0000',
      groupId: 'stack1',
      data: [
        new Point(18, null, { pointDuration: 2, oldest: true, fake: true }),
        new Point(20, 2, { pointDuration: 2, oldest: true, newest: true }),
      ],
    }]);
  });

  it('calculates series state when optional series fields are not defined', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesTemplate: {
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
              dataProvider: {
                functionName: 'loadSeries',
                functionArguments: {
                  sourceType: 'external',
                  sourceSpecProvider: {
                    functionName: 'literal',
                    functionArguments: {
                      data: {
                        externalSourceName: 'dummy',
                      },
                    },
                  },
                },
              },
            },
          },
        }],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([{
      id: 's1',
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: null,
      groupId: null,
      data: [
        new Point(18, null, { pointDuration: 2, oldest: true, fake: true }),
        new Point(20, 2, { pointDuration: 2, oldest: true, newest: true }),
      ],
    }]);
  });

  it('calculates series state when all possible series fields are functions', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [{
          builderType: 'dynamic',
          builderRecipe: {
            dynamicSeriesConfigsSource: {
              sourceType: 'external',
              sourceSpec: {
                externalSourceName: 'dummyDynamic',
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
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'type',
                },
              },
              yAxisIdProvider: {
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'yAxisId',
                },
              },
              colorProvider: {
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'color',
                },
              },
              groupIdProvider: {
                functionName: 'getDynamicSeriesConfig',
                functionArguments: {
                  propertyName: 'groupId',
                },
              },
              dataProvider: {
                functionName: 'loadSeries',
                functionArguments: {
                  sourceType: 'external',
                  sourceSpecProvider: {
                    functionName: 'literal',
                    functionArguments: {
                      data: {
                        externalSourceName: 'dummy',
                      },
                    },
                  },
                },
              },
            },
          },
        }],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [20, 2],
        ]),
        dummyDynamic: {
          fetchDynamicSeriesConfigs: () => {
            return [{
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
              color: '#ff0000',
              groupId: 'stack1',
            }];
          },
        },
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([{
      id: 's1',
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: '#ff0000',
      groupId: 'stack1',
      data: [
        new Point(18, null, { pointDuration: 2, oldest: true, fake: true }),
        new Point(20, 2, { pointDuration: 2, oldest: true, newest: true }),
      ],
    }]);
  });

  it('calculates series state with nested series functions', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesTemplate: {
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
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
                                externalSourceName: 'dummy',
                              },
                            },
                          },
                        },
                      }, {
                        functionName: 'literal',
                        functionArguments: {
                          data: 3,
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
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([
          [18, -1],
          [20, 2],
        ]),
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([{
      id: 's1',
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: null,
      groupId: null,
      data: [
        new Point(18, 3, { pointDuration: 2, oldest: true }),
        new Point(20, 6, { pointDuration: 2, newest: true }),
      ],
    }]);
  });

  it('calculates synchronized series state based on badly-timed series', async function () {
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [
          dummyStaticSeriesFactory(1, 'dummy1'),
          dummyStaticSeriesFactory(2, 'dummy2'),
        ],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        pointsCount: 2,
      }],
      externalDataSources: {
        dummy1: dummyDataSource([
          [20, 2],
        ]),
        dummy2: dummyDataSource([
          [18, 1],
        ]),
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([
      dummyStaticSeriesFactoryState(1, [
        new Point(18, null, { pointDuration: 2, oldest: true, fake: true }),
        new Point(20, 2, { pointDuration: 2, oldest: true, newest: true }),
      ]),
      dummyStaticSeriesFactoryState(2, [
        new Point(18, 1, { pointDuration: 2, oldest: true, newest: true }),
        new Point(20, null, { pointDuration: 2, newest: true, fake: true }),
      ]),
    ]);
  });

  it('calculates series state with data fetched according to the timing in configuration', async function () {
    const dummySrc = dummyDataSource([
      [16, 0],
      [18, 1],
      [20, 2],
    ]);
    const config = new Configuration({
      chartDefinition: {
        seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
      },
      timeResolutionSpecs: [{
        timeResolution: 1,
        pointsCount: 2,
      }, {
        timeResolution: 2,
        pointsCount: 3,
      }],
      externalDataSources: {
        dummy: dummySrc,
      },
    });
    config.setViewParameters({
      lastPointTimestamp: 20,
      timeResolution: 2,
    });

    const state = await config.getState();

    expect(dummySrc.fetchSeries).to.be.calledWith({
      lastPointTimestamp: 20,
      timeResolution: 2,
      pointsCount: 4,
    }, undefined);

    expect(state.series).to.deep.equal([
      dummyStaticSeriesFactoryState(1, [
        new Point(16, 0, { pointDuration: 2, oldest: true }),
        new Point(18, 1, { pointDuration: 2 }),
        new Point(20, 2, {
          pointDuration: 2,
          lastMeasurementTimestamp: 20,
          newest: true,
        }),
      ]),
    ]);
  });

  context('in live mode', function () {
    it('calculates series and newestPointTimestamp state for null lastPointTimestamp',
      async function (done) {
        const nowTimestamp = Math.floor(Date.now() / 1000);
        // There will be always 10 subtracted from `nowTimestamp` to take
        // live data delay into account. See Configuration.liveModeTimestampOffset docs.
        const dummySrc = dummyDataSource([
          [nowTimestamp - 12, 1],
          [nowTimestamp - 11, 2],
        ]);
        const config = new Configuration({
          chartDefinition: {
            seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            pointsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: true,
          lastPointTimestamp: null,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledWith({
          lastPointTimestamp: nowTimestamp - 10,
          timeResolution: 1,
          pointsCount: 4,
        }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            new Point(nowTimestamp - 12, 1, { pointDuration: 1, oldest: true }),
            new Point(nowTimestamp - 11, 2, { pointDuration: 1, newest: true }),
            new Point(nowTimestamp - 10, null, {
              pointDuration: 1,
              newest: true,
              fake: true,
            }),
          ]),
        ]);
        expect(state.newestPointTimestamp).to.be.null;
        done();
      });
  });

  context('in non-live mode', function () {
    it('calculates series and newestPointTimestamp state for null lastPointTimestamp',
      async function (done) {
        const dummy1Src = dummyDataSource([
          [19, 1],
          [20, 2],
        ]);
        const dummy2Src = dummyDataSource([
          [18, 3],
          [19, 4],
        ]);
        const config = new Configuration({
          chartDefinition: {
            seriesBuilders: [
              dummyStaticSeriesFactory(1, 'dummy1'),
              dummyStaticSeriesFactory(2, 'dummy2'),
            ],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            pointsCount: 3,
          }],
          externalDataSources: {
            dummy1: dummy1Src,
            dummy2: dummy2Src,
          },
        });
        config.setViewParameters({
          live: false,
          lastPointTimestamp: null,
        });

        const state = await config.getState();

        expect(dummy1Src.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastPointTimestamp: null,
            timeResolution: 1,
            pointsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastPointTimestamp: 20,
            timeResolution: 1,
            pointsCount: 4,
          }, undefined);
        expect(dummy2Src.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastPointTimestamp: null,
            timeResolution: 1,
            pointsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastPointTimestamp: 20,
            timeResolution: 1,
            pointsCount: 4,
          }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            new Point(18, null, { pointDuration: 1, oldest: true, fake: true }),
            new Point(19, 1, { pointDuration: 1, oldest: true }),
            new Point(20, 2, { pointDuration: 1, newest: true }),
          ]),
          dummyStaticSeriesFactoryState(2, [
            new Point(18, 3, { pointDuration: 1, oldest: true }),
            new Point(19, 4, { pointDuration: 1, newest: true }),
            new Point(20, null, { pointDuration: 1, newest: true, fake: true }),
          ]),
        ]);
        expect(state.newestPointTimestamp).to.equal(20);
        done();
      });

    it('calculates series and newestPointTimestamp state for non-null lastPointTimestamp',
      async function (done) {
        const dummySrc = {
          fetchSeries: sinon.spy(({ lastPointTimestamp }) => {
            if (lastPointTimestamp === 19) {
              return [{ timestamp: 19, value: 1 }];
            } else if (lastPointTimestamp === null) {
              return [{ timestamp: 20, value: 2 }, { timestamp: 19, value: 1 }];
            }
            return [];
          }),
        };
        const config = new Configuration({
          chartDefinition: {
            seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            pointsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: false,
          lastPointTimestamp: 19,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastPointTimestamp: null,
            timeResolution: 1,
            pointsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastPointTimestamp: 19,
            timeResolution: 1,
            pointsCount: 4,
          }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            new Point(17, null, { pointDuration: 1, oldest: true, fake: true }),
            new Point(18, null, { pointDuration: 1, oldest: true, fake: true }),
            new Point(19, 1, { pointDuration: 1, oldest: true }),
          ]),
        ]);
        expect(state.newestPointTimestamp).to.equal(20);
        done();
      });

    it('calculates series and newestPointTimestamp state for null lastPointTimestamp and larger time resolution',
      async function (done) {
        const dummySrc = {
          fetchSeries: sinon.spy(({ timeResolution }) => {
            if (timeResolution === 2) {
              return [{ timestamp: 18, value: 1 }];
            } else if (timeResolution === 1) {
              return [{ timestamp: 19, value: 2 }, { timestamp: 18, value: 1 }];
            }
            return [];
          }),
        };
        const config = new Configuration({
          chartDefinition: {
            seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            pointsCount: 3,
          }, {
            timeResolution: 2,
            pointsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: false,
          timeResolution: 2,
          lastPointTimestamp: null,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastPointTimestamp: null,
            timeResolution: 1,
            pointsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastPointTimestamp: 19,
            timeResolution: 2,
            pointsCount: 4,
          }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            new Point(14, null, { pointDuration: 2, oldest: true, fake: true }),
            new Point(16, null, { pointDuration: 2, oldest: true, fake: true }),
            new Point(18, 1, { pointDuration: 2, oldest: true, newest: true }),
          ]),
        ]);
        expect(state.newestPointTimestamp).to.equal(19);
        done();
      });

    it('calculates series and newestPointTimestamp state for null lastPointTimestamp and irregular time resolution sizes',
      async function (done) {
        const dummySrc = {
          fetchSeries: sinon.spy(({ timeResolution }) => {
            if (timeResolution === 6) {
              return [{ timestamp: 24, value: 1 }];
            }
            return [];
          }),
        };
        const config = new Configuration({
          chartDefinition: {
            seriesBuilders: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 6,
            pointsCount: 3,
          }, {
            timeResolution: 7,
            pointsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: false,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastPointTimestamp: null,
            timeResolution: 6,
            pointsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastPointTimestamp: 28,
            timeResolution: 6,
            pointsCount: 4,
          }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            new Point(12, null, { pointDuration: 6, oldest: true, fake: true }),
            new Point(18, null, { pointDuration: 6, oldest: true, fake: true }),
            new Point(24, 1, { pointDuration: 6, oldest: true, newest: true }),
          ]),
        ]);
        expect(state.newestPointTimestamp).to.equal(28);
        done();
      });
  });
});

function asPlainJson(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function dummyDataSource(points) {
  return {
    fetchSeries: sinon.spy(() => {
      return points.map(([timestamp, value]) => ({ timestamp, value }));
    }),
  };
}

function dummyStaticSeriesGroupFactory(seriesGroupNo) {
  return {
    builderType: 'static',
    builderRecipe: {
      seriesGroupTemplate: {
        idProvider: `g${seriesGroupNo}`,
        nameProvider: `series${seriesGroupNo}`,
      },
    },
  };
}

function dummyStaticSeriesGroupFactoryState(seriesGroupNo) {
  return {
    id: `g${seriesGroupNo}`,
    name: `series${seriesGroupNo}`,
    stacked: false,
    showSum: false,
    subgroups: [],
  };
}

function dummyStaticSeriesFactory(seriesNo, externalSourceName) {
  return {
    builderType: 'static',
    builderRecipe: {
      seriesTemplate: {
        id: `s${seriesNo}`,
        name: `series${seriesNo}`,
        type: 'bar',
        yAxisId: 'a1',
        dataProvider: {
          functionName: 'loadSeries',
          functionArguments: {
            sourceType: 'external',
            sourceSpecProvider: {
              functionName: 'literal',
              functionArguments: {
                data: {
                  externalSourceName,
                },
              },
            },
          },
        },
      },
    },
  };
}

function dummyStaticSeriesFactoryState(seriesNo, data) {
  return {
    id: `s${seriesNo}`,
    name: `series${seriesNo}`,
    type: 'bar',
    yAxisId: 'a1',
    color: null,
    groupId: null,
    data,
  };
}
