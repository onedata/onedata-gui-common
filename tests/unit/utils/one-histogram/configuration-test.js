import { expect } from 'chai';
import { describe, it, beforeEach, afterEach, context } from 'mocha';
import sinon from 'sinon';
import Configuration from 'onedata-gui-common/utils/one-histogram/configuration';
import point from 'onedata-gui-common/utils/one-histogram/series-functions/utils/point';
import { run } from '@ember/runloop';
import moment from 'moment';

describe('Unit | Utility | one histogram/configuration', function () {
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

  it('calls state change handlers repeatedly due to chart updates in live mode', function () {
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
      expect(handler).to.have.callCount(i);
    }
  });

  it('changes frequency of calling state change handlers in live mode after chaging time resolution', function () {
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
    expect(handler).to.be.calledOnce;
    config.setViewParameters({ timeResolution: 2 });
    expect(handler).to.be.calledTwice;
    this.fakeClock.tick(520);
    expect(handler).to.be.calledTwice;
    this.fakeClock.tick(520);
    expect(handler).to.be.calledThrice;

    for (let i = 1; i <= 5; i++) {
      this.fakeClock.tick(1020);
      expect(handler).to.have.callCount(i + 3);
    }
  });

  it('does not call state change handlers repeatedly when live mode is off', function () {
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
    expect(handler).to.be.calledOnce;
    config.setViewParameters({ live: false });
    expect(handler).to.be.calledTwice;
    this.fakeClock.tick(2000);
    expect(handler).to.be.calledTwice;
  });

  it('does not call state change handlers in live mode after destroy', function () {
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
    expect(handler).to.be.calledOnce;
    // We need to use `run`, because Looper uses Ember runloop functions - in
    // this case it is `cancel`, which throws an error.
    run(() => config.destroy());
    expect(handler).to.be.calledOnce;
    this.fakeClock.tick(2000);
    expect(handler).to.be.calledOnce;
  });

  it('calculates state with title', async function () {
    const config = new Configuration({
      rawConfiguration: {
        title: 'abc',
      },
    });

    const state = await config.getState();

    expect(state.title).to.equal('abc');
  });

  it('calculates state with a default time resolution spec (first one)', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        windowsCount: 10,
        updateInterval: 0.5,
      }, {
        timeResolution: 2,
        windowsCount: 5,
        updateInterval: 1,
      }],
    });

    const state = await config.getState();

    expect(state.timeResolution).to.equal(1);
    expect(state.windowsCount).to.equal(10);
  });

  it('calculates state with changed time resolution spec', async function () {
    const config = new Configuration({
      timeResolutionSpecs: [{
        timeResolution: 1,
        windowsCount: 10,
        updateInterval: 0.5,
      }, {
        timeResolution: 2,
        windowsCount: 5,
        updateInterval: 1,
      }],
    });

    config.setViewParameters({ timeResolution: 2 });
    const state = await config.getState();

    expect(state.timeResolution).to.equal(2);
    expect(state.windowsCount).to.equal(5);
  });

  it('calculates state with previous time resolution spec (first one) when changed spec was incorrect',
    async function () {
      const config = new Configuration({
        timeResolutionSpecs: [{
          timeResolution: 1,
          windowsCount: 10,
          updateInterval: 0.5,
        }, {
          timeResolution: 2,
          windowsCount: 5,
          updateInterval: 1,
        }],
      });

      config.setViewParameters({ timeResolution: 2 });
      config.setViewParameters({ timeResolution: 20 });
      const state = await config.getState();

      expect(state.timeResolution).to.equal(2);
      expect(state.windowsCount).to.equal(5);
    });

  it('calculates y axes state without custom value formatters', async function () {
    const config = new Configuration({
      rawConfiguration: {
        yAxes: [{
          id: 'a1',
          name: 'axis1',
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
    }, {
      id: 'a2',
      name: 'axis2',
    }]);
    expect(state.yAxes[0].valueFormatter(123)).to.equal(123);
    expect(state.yAxes[1].valueFormatter(123)).to.equal(123);
  });

  it('calculates y axes state with custom value formatters', async function () {
    const config = new Configuration({
      rawConfiguration: {
        yAxes: [{
          id: 'a1',
          name: 'axis1',
          valueFormatter: {
            functionName: 'abs',
            functionArguments: {
              data: {
                functionName: 'supplyValue',
              },
            },
          },
        }, {
          id: 'a2',
          name: 'axis2',
          valueFormatter: {
            functionName: 'asBytes',
            functionArguments: {
              data: {
                functionName: 'multiply',
                functionArguments: {
                  operands: [{
                    functionName: 'supplyValue',
                  }, 2],
                },
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
    }, {
      id: 'a2',
      name: 'axis2',
    }]);
    expect(state.yAxes[0].valueFormatter(-123)).to.equal(123);
    expect(state.yAxes[1].valueFormatter(123)).to.equal('246 B');
  });

  it('calculates x axis state', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [dummyStaticSeriesFactory(1, 'dummy')],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 5,
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

  it('calculates empty series state when there are no series defined', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 5,
      }],
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([]);
  });

  it('calculates series state using static factory', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [dummyStaticSeriesFactory(1, 'dummy')],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
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
      stackId: null,
      data: [
        point(18, null, { oldest: true, fake: true }),
        point(20, 2, { oldest: true, newest: true }),
      ],
    }]);
  });

  it('calculates series state using dynamic factory (multiple scenario)', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [{
          factoryName: 'dynamic',
          factoryArguments: {
            dynamicSeriesConfigs: {
              sourceType: 'external',
              sourceParameters: {
                externalSourceName: 'dummyDynamic',
              },
            },
            seriesTemplate: {
              id: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'id',
                },
              },
              name: 'series1',
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
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
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
      stackId: null,
      data: [
        point(18, null, { oldest: true, fake: true }),
        point(20, 2, { oldest: true, newest: true }),
      ],
    })));
  });

  it('calculates series state using dynamic factory (empty scenario)', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [{
          factoryName: 'dynamic',
          factoryArguments: {
            dynamicSeriesConfigs: {
              sourceType: 'external',
              sourceParameters: {
                externalSourceName: 'dummyDynamic',
              },
            },
            seriesTemplate: {
              id: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'id',
                },
              },
              name: 'series1',
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
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
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
      rawConfiguration: {
        series: [{
          factoryName: 'static',
          factoryArguments: {
            seriesTemplate: {
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
              color: '#ff0000',
              stackId: 'stack1',
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
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
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
      stackId: 'stack1',
      data: [
        point(18, null, { oldest: true, fake: true }),
        point(20, 2, { oldest: true, newest: true }),
      ],
    }]);
  });

  it('calculates series state when optional series fields are not defined', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [{
          factoryName: 'static',
          factoryArguments: {
            seriesTemplate: {
              id: 's1',
              name: 'series1',
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
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([]),
      },
    });

    const state = await config.getState();

    expect(state.series).to.deep.equal([{
      id: 's1',
      name: 'series1',
      type: 'bar',
      yAxisId: 'a1',
      color: null,
      stackId: null,
      data: [],
    }]);
  });

  it('calculates series state when all possible series fields are functions', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [{
          factoryName: 'dynamic',
          factoryArguments: {
            dynamicSeriesConfigs: {
              sourceType: 'external',
              sourceParameters: {
                externalSourceName: 'dummyDynamic',
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
              type: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'type',
                },
              },
              yAxisId: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'yAxisId',
                },
              },
              color: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'color',
                },
              },
              stackId: {
                functionName: 'getDynamicSeriesConfigData',
                functionArguments: {
                  propertyName: 'stackId',
                },
              },
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
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
      }],
      externalDataSources: {
        dummy: dummyDataSource([]),
        dummyDynamic: {
          fetchDynamicSeriesConfigs: () => {
            return [{
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
              color: '#ff0000',
              stackId: 'stack1',
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
      stackId: 'stack1',
      data: [],
    }]);
  });

  it('calculates series state with nested series functions', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [{
          factoryName: 'static',
          factoryArguments: {
            seriesTemplate: {
              id: 's1',
              name: 'series1',
              type: 'bar',
              yAxisId: 'a1',
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
                            externalSourceName: 'dummy',
                          },
                        },
                      }, 3],
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
        windowsCount: 2,
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
      stackId: null,
      data: [point(18, 3, { oldest: true }), point(20, 6, { newest: true })],
    }]);
  });

  it('calculates synchronized series state based on badly-timed series', async function () {
    const config = new Configuration({
      rawConfiguration: {
        series: [
          dummyStaticSeriesFactory(1, 'dummy1'),
          dummyStaticSeriesFactory(2, 'dummy2'),
        ],
      },
      timeResolutionSpecs: [{
        timeResolution: 2,
        windowsCount: 2,
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
        point(18, null, { oldest: true, fake: true }),
        point(20, 2, { oldest: true, newest: true }),
      ]),
      dummyStaticSeriesFactoryState(2, [
        point(18, 1, { oldest: true, newest: true }),
        point(20, null, { newest: true, fake: true }),
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
      rawConfiguration: {
        series: [dummyStaticSeriesFactory(1, 'dummy')],
      },
      timeResolutionSpecs: [{
        timeResolution: 1,
        windowsCount: 2,
      }, {
        timeResolution: 2,
        windowsCount: 3,
      }],
      externalDataSources: {
        dummy: dummySrc,
      },
    });
    config.setViewParameters({
      lastWindowTimestamp: 20,
      timeResolution: 2,
    });

    const state = await config.getState();

    expect(dummySrc.fetchSeries).to.be.calledWith({
      lastWindowTimestamp: 20,
      timeResolution: 2,
      windowsCount: 4,
    }, undefined);

    expect(state.series).to.deep.equal([
      dummyStaticSeriesFactoryState(1, [
        point(16, 0, { oldest: true }),
        point(18, 1),
        point(20, 2, { newest: true }),
      ]),
    ]);
  });

  context('in live mode', function () {
    it('calculates series and newestWindowTimestamp state for null lastWindowTimestamp',
      async function (done) {
        const nowTimestamp = Math.floor(Date.now() / 1000);
        const dummySrc = dummyDataSource([
          [nowTimestamp - 2, 1],
          [nowTimestamp - 1, 2],
        ]);
        const config = new Configuration({
          rawConfiguration: {
            series: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            windowsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: true,
          lastWindowTimestamp: null,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledWith({
          lastWindowTimestamp: nowTimestamp,
          timeResolution: 1,
          windowsCount: 4,
        }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            point(nowTimestamp - 2, 1, { oldest: true }),
            point(nowTimestamp - 1, 2, { newest: true }),
            point(nowTimestamp, null, { newest: true, fake: true }),
          ]),
        ]);
        expect(state.newestWindowTimestamp).to.be.null;
        done();
      });
  });

  context('in non-live mode', function () {
    it('calculates series and newestWindowTimestamp state for null lastWindowTimestamp',
      async function (done) {
        const dummySrc = dummyDataSource([
          [19, 1],
          [20, 2],
        ]);
        const config = new Configuration({
          rawConfiguration: {
            series: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            windowsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: false,
          lastWindowTimestamp: null,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledOnce.and.to.be.calledWith({
          lastWindowTimestamp: null,
          timeResolution: 1,
          windowsCount: 4,
        }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            point(18, null, { oldest: true, fake: true }),
            point(19, 1, { oldest: true }),
            point(20, 2, { newest: true }),
          ]),
        ]);
        expect(state.newestWindowTimestamp).to.equal(20);
        done();
      });

    it('calculates series and newestWindowTimestamp state for non-null lastWindowTimestamp',
      async function (done) {
        const dummySrc = {
          fetchSeries: sinon.spy(({ lastWindowTimestamp }) => {
            if (lastWindowTimestamp === 19) {
              return [{ timestamp: 19, value: 1 }];
            } else if (lastWindowTimestamp === null) {
              return [{ timestamp: 20, value: 2 }, { timestamp: 19, value: 1 }];
            }
            return [];
          }),
        };
        const config = new Configuration({
          rawConfiguration: {
            series: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            windowsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: false,
          lastWindowTimestamp: 19,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastWindowTimestamp: null,
            timeResolution: 1,
            windowsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastWindowTimestamp: 19,
            timeResolution: 1,
            windowsCount: 4,
          }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            point(17, null, { oldest: true, fake: true }),
            point(18, null, { oldest: true, fake: true }),
            point(19, 1, { oldest: true }),
          ]),
        ]);
        expect(state.newestWindowTimestamp).to.equal(20);
        done();
      });

    it('calculates series and newestWindowTimestamp state for null lastWindowTimestamp and larger time resolution',
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
          rawConfiguration: {
            series: [dummyStaticSeriesFactory(1, 'dummy')],
          },
          timeResolutionSpecs: [{
            timeResolution: 1,
            windowsCount: 3,
          }, {
            timeResolution: 2,
            windowsCount: 3,
          }],
          externalDataSources: {
            dummy: dummySrc,
          },
        });
        config.setViewParameters({
          live: false,
          timeResolution: 2,
          lastWindowTimestamp: null,
        });

        const state = await config.getState();

        expect(dummySrc.fetchSeries).to.be.calledTwice
          .and.to.be.calledWith({
            lastWindowTimestamp: null,
            timeResolution: 1,
            windowsCount: 2,
          }, undefined)
          .and.to.be.calledWith({
            lastWindowTimestamp: null,
            timeResolution: 2,
            windowsCount: 4,
          }, undefined);

        expect(state.series).to.deep.equal([
          dummyStaticSeriesFactoryState(1, [
            point(14, null, { oldest: true, fake: true }),
            point(16, null, { oldest: true, fake: true }),
            point(18, 1, { oldest: true, newest: true }),
          ]),
        ]);
        expect(state.newestWindowTimestamp).to.equal(19);
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

function dummyStaticSeriesFactory(seriesNo, externalSourceName) {
  return {
    factoryName: 'static',
    factoryArguments: {
      seriesTemplate: {
        id: `s${seriesNo}`,
        name: `series${seriesNo}`,
        type: 'bar',
        yAxisId: 'a1',
        data: {
          functionName: 'loadSeries',
          functionArguments: {
            sourceType: 'external',
            sourceParameters: {
              externalSourceName,
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
    stackId: null,
    data,
  };
}
