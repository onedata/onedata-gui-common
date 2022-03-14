import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import State from 'onedata-gui-common/utils/one-time-series-chart/state';

describe('Unit | Utility | one time series chart/state', function () {
  testStateContainsCopiedProperty({
    propName: 'title',
    value: {
      content: 'some title',
      tip: 'some tip',
    },
  });
  testStateContainsCopiedProperty({ propName: 'yAxes', value: [] });
  testStateContainsCopiedProperty({ propName: 'xAxis', value: {} });
  testStateContainsCopiedProperty({ propName: 'series', value: [] });
  testStateContainsCopiedProperty({ propName: 'timeResolution', value: 10 });
  testStateContainsCopiedProperty({ propName: 'pointsCount', value: 10 });
  testStateContainsCopiedProperty({ propName: 'newestPointTimestamp', value: 10 });

  it('has true "hasReachedOldest" and "hasReachedNewest" when there are no series defined', function () {
    const state = new State({});

    expect(state.hasReachedOldest).to.be.true;
    expect(state.hasReachedNewest).to.be.true;
  });

  it('has true "hasReachedOldest" and "hasReachedNewest" when provided series are empty', function () {
    const state = new State({
      series: [{
        data: [],
      }, {
        data: [],
      }],
    });

    expect(state.hasReachedOldest).to.be.true;
    expect(state.hasReachedNewest).to.be.true;
  });

  it('has true "hasReachedOldest" when provided series have first point with "oldest" equal to true',
    function () {
      const state = new State({
        series: [{
          data: [{ oldest: true }, { oldest: false }],
        }, {
          data: [{ oldest: true }, { oldest: false }],
        }],
      });

      expect(state.hasReachedOldest).to.be.true;
    });

  it('has false "hasReachedOldest" when at least one series has first point with "oldest" equal to false',
    function () {
      const state = new State({
        series: [{
          data: [{ oldest: true }, { oldest: false }],
        }, {
          data: [{ oldest: false }, { oldest: false }],
        }],
      });

      expect(state.hasReachedOldest).to.be.false;
    });

  it('has true "hasReachedNewest" when provided series have last point with "newest" equal to true',
    function () {
      const state = new State({
        series: [{
          data: [{ newest: false }, { newest: true }],
        }, {
          data: [{ newest: false }, { newest: true }],
        }],
      });

      expect(state.hasReachedNewest).to.be.true;
    });

  it('has false "hasReachedNewest" when at least one series has first point with "newest" equal to false',
    function () {
      const state = new State({
        series: [{
          data: [{ newest: false }, { newest: true }],
        }, {
          data: [{ newest: false }, { newest: false }],
        }],
      });

      expect(state.hasReachedNewest).to.be.false;
    });

  it('has null "firstPointTimestamp" and "lastPointTimestamp" when there are no series defined', function () {
    const state = new State({});

    expect(state.firstPointTimestamp).to.be.null;
    expect(state.lastPointTimestamp).to.be.null;
  });

  it('has null "firstPointTimestamp" and "lastPointTimestamp" when provided series are empty', function () {
    const state = new State({
      series: [{
        data: [],
      }, {
        data: [],
      }],
    });

    expect(state.firstPointTimestamp).to.be.null;
    expect(state.lastPointTimestamp).to.be.null;
  });

  it('has "firstPointTimestamp" set to the first point timestamp and "lastPointTimestamp" set to the last point timestamp',
    function () {
      const state = new State({
        series: [{
          data: [{ timestamp: 10 }, { timestamp: 20 }],
        }, {
          data: [{ timestamp: 10 }, { timestamp: 20 }],
        }],
      });

      expect(state.firstPointTimestamp).to.equal(10);
      expect(state.lastPointTimestamp).to.equal(20);
    });

  context('when converting to Echart state', function () {
    it('converts xAxis', function () {
      const state = new State({
        xAxis: {
          timestamps: [10, 20, 30],
          timestampFormatter: (value) => value + 's',
        },
      });
      const echartState = state.asEchartState();

      expect(asPlainJson(echartState.xAxis)).to.deep.equal({
        type: 'category',
        data: ['10', '20', '30'],
        axisLabel: {
          showMaxLabel: true,
        },
        axisTick: {
          alignWithLabel: true,
        },
      });
      expect(echartState.xAxis.axisLabel.formatter(123)).to.equal('123s');
    });

    it('converts yAxes', function () {
      const state = new State({
        yAxes: [{
          name: 'axis1',
          minInterval: 1,
          valueFormatter: (value) => value + ' bytes',
        }, {
          name: 'axis2',
          minInterval: null,
          valueFormatter: (value) => value + ' bits',
        }],
      });
      const echartState = state.asEchartState();

      expect(asPlainJson(echartState.yAxis)).to.deep.equal([{
        type: 'value',
        name: 'axis1',
        minInterval: 1,
        axisLine: {
          show: true,
        },
        axisLabel: {},
      }, {
        type: 'value',
        name: 'axis2',
        minInterval: null,
        axisLine: {
          show: true,
        },
        axisLabel: {},
      }]);
      expect(echartState.yAxis[0].axisLabel.formatter(123)).to.equal('123 bytes');
      expect(echartState.yAxis[1].axisLabel.formatter(123)).to.equal('123 bits');
    });

    it('converts series', function () {
      const state = new State({
        yAxes: [{
          id: 'a1',
        }, {
          id: 'a2',
        }],
        series: [{
          id: 's1',
          name: 'series 1',
          type: 'bar',
          yAxisId: 'a2',
          color: '#ff0000',
          stackId: 'abc',
          data: [{
            timestamp: 10,
            value: 1,
          }, {
            timestamp: 20,
            value: 2,
          }],
        }, {
          id: 's2',
          name: 'series 2',
          type: 'line',
          yAxisId: 'a1',
          color: null,
          stackId: null,
          data: [{
            timestamp: 10,
            value: null,
          }, {
            timestamp: 20,
            value: 3,
          }],
        }],
      });
      const echartState = state.asEchartState();

      expect(echartState.series).to.deep.equal([{
        id: 's1',
        name: 'series 1',
        type: 'bar',
        yAxisIndex: 1,
        color: '#ff0000',
        stack: 'abc',
        areaStyle: {},
        smooth: 0.2,
        data: [
          ['10', 1],
          ['20', 2],
        ],
      }, {
        id: 's2',
        name: 'series 2',
        type: 'line',
        yAxisIndex: 0,
        color: null,
        stack: null,
        areaStyle: null,
        smooth: 0.2,
        data: [
          ['10', null],
          ['20', 3],
        ],
      }]);
    });

    it('includes tooltip config', function () {
      const state = new State({});
      const echartState = state.asEchartState();

      expect(asPlainJson(echartState.tooltip)).to.deep.equal({
        trigger: 'axis',
        confine: true,
        axisPointer: {
          type: 'cross',
          label: {
            show: false,
          },
        },
      });
      expect(typeof echartState.tooltip.formatter).to.equal('function');
    });

    it('creates tooltip formatter which returns null for empty input', function () {
      const state = new State({});
      const echartState = state.asEchartState();

      expect(asPlainJson(echartState.tooltip.formatter())).to.be.null;
    });

    it('creates tooltip formatter which returns null when input is an empty array', function () {
      const state = new State({});
      const echartState = state.asEchartState();

      expect(asPlainJson(echartState.tooltip.formatter([]))).to.be.null;
    });

    it('creates tooltip formatter which returns formatted timestamp and info about each series point',
      function () {
        const state = new State({
          xAxis: {
            timestamps: [],
            timestampFormatter: (value) => value + 's',
          },
          yAxes: [{
            id: 'a1',
            valueFormatter: (value) => value + ' bytes',
          }, {
            id: 'a2',
            valueFormatter: (value) => value + ' bits',
          }],
          series: [{
            id: 's1',
            yAxisId: 'a2',
            data: [],
          }, {
            id: 's2',
            yAxisId: 'a1',
            data: [],
          }],
        });
        const echartState = state.asEchartState();

        const parser = new DOMParser();
        const tooltipDom = parser.parseFromString(echartState.tooltip.formatter([{
          seriesId: 's1',
          seriesName: 'series1',
          value: ['10', 5],
          marker: '<span class="marker-s1"></span>',
        }, {
          seriesId: 's2',
          seriesName: 'series2',
          value: ['10', 6],
          marker: '<span class="marker-s2"></span>',
        }]), 'text/html');

        const tooltipHeader = tooltipDom.querySelectorAll('.tooltip-header');
        expect(tooltipHeader).to.have.length(1);
        expect(tooltipHeader[0].textContent).to.equal('10s');

        const tooltipSeries = tooltipDom.querySelectorAll('.tooltip-series');
        expect(tooltipSeries).to.have.length(2);
        [{
          markerSelector: '.marker-s1',
          label: 'series1',
          value: '5 bits',
        }, {
          markerSelector: '.marker-s2',
          label: 'series2',
          value: '6 bytes',
        }].forEach(({ markerSelector, label, value }, idx) => {
          const labelNode = tooltipSeries[idx].querySelectorAll('.tooltip-series-label');
          expect(labelNode).to.have.length(1);
          expect(labelNode[0].querySelectorAll(markerSelector)).to.have.length(1);
          expect(labelNode[0].textContent.trim()).to.equal(label);

          const valueNode = tooltipSeries[idx].querySelectorAll('.tooltip-series-value');
          expect(valueNode).to.have.length(1);
          expect(valueNode[0].textContent.trim()).to.equal(value);
        });
      });

    it('creates tooltip formatter which does not allow to inject HTML tags through names and values',
      function () {
        const state = new State({
          xAxis: {
            timestamps: [],
            timestampFormatter: () => '<span class="timestamp-injection"></span>',
          },
          yAxes: [{
            id: 'a1',
            valueFormatter: () => '<span class="value-injection"></span>',
          }],
          series: [{
            id: 's1',
            yAxisId: 'a1',
            data: [],
          }],
        });
        const echartState = state.asEchartState();

        const parser = new DOMParser();
        const tooltipDom = parser.parseFromString(echartState.tooltip.formatter([{
          seriesId: 's1',
          seriesName: '<span class="name-injection"></span>',
          value: ['10', 5],
          marker: '',
        }]), 'text/html');

        expect(tooltipDom.querySelectorAll('.timestamp-injection')).to.have.length(0);
        expect(tooltipDom.querySelectorAll('.value-injection')).to.have.length(0);
        expect(tooltipDom.querySelectorAll('.name-injection')).to.have.length(0);
      });
  });
});

function testStateContainsCopiedProperty({ propName, value }) {
  it(`copies "${propName}" value during initialization`, function () {
    const state = new State({
      [propName]: value,
    });
    expect(state[propName]).to.equal(value);
  });
}

function asPlainJson(obj) {
  return JSON.parse(JSON.stringify(obj));
}
