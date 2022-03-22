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
  testStateContainsCopiedProperty({ propName: 'seriesGroups', value: [] });
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
        seriesGroups: [{
          id: 'group1',
          stack: true,
        }, {
          id: 'group2',
          stack: false,
        }],
        series: [{
          id: 's1',
          name: 'series 1',
          type: 'bar',
          yAxisId: 'a2',
          color: '#ff0000',
          groupId: 'group1',
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
          groupId: 'group2',
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
        stack: 'group1',
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

    it('creates tooltip formatter which allows series groups',
      function () {
        const state = new State({
          xAxis: {
            timestamps: [],
            timestampFormatter: (value) => value + 's',
          },
          yAxes: [{
            id: 'a1',
            valueFormatter: (value) => value + ' bytes',
          }],
          seriesGroups: [{
            id: 'g1',
            name: 'group1',
            showSeriesSum: false,
          }, {
            id: 'g2',
            name: 'group2',
            showSeriesSum: true,
          }, {
            id: 'g3',
          }],
          series: [{
            id: 's1',
            yAxisId: 'a1',
            groupId: 'g1',
            data: [],
          }, {
            id: 's2',
            yAxisId: 'a1',
            groupId: 'g2',
            data: [],
          }, {
            id: 's3',
            yAxisId: 'a1',
            data: [],
          }, {
            id: 's4',
            yAxisId: 'a1',
            groupId: 'g1',
            data: [],
          }, {
            id: 's5',
            yAxisId: 'a1',
            groupId: 'g2',
            data: [],
          }, {
            id: 's6',
            yAxisId: 'a1',
            groupId: 'g3',
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
        }, {
          seriesId: 's3',
          seriesName: 'series3',
          value: ['10', 7],
          marker: '<span class="marker-s3"></span>',
        }, {
          seriesId: 's4',
          seriesName: 'series4',
          value: ['10', 8],
          marker: '<span class="marker-s4"></span>',
        }, {
          seriesId: 's5',
          seriesName: 'series5',
          value: ['10', 9],
          marker: '<span class="marker-s5"></span>',
        }, {
          seriesId: 's6',
          seriesName: 'series6',
          value: ['10', 10],
          marker: '<span class="marker-s6"></span>',
        }]), 'text/html');

        const tooltipEntries = tooltipDom.querySelectorAll('.tooltip-header ~ *');
        expect(tooltipEntries).to.have.length(12);

        // separator before ungrouped series
        expect([...tooltipEntries[0].classList]).to.include('tooltip-series-separator');

        // ungrouped series
        expect([...tooltipEntries[1].classList]).to.not.include('tooltip-group-header');
        expect(tooltipEntries[1].textContent).to.include('series3');

        // separator before first group
        expect([...tooltipEntries[2].classList]).to.include('tooltip-series-separator');

        // first group header, without sum
        expect([...tooltipEntries[3].classList]).to.include('tooltip-group-header');
        expect(tooltipEntries[3].textContent.trim()).to.equal('group1');

        // first group series
        expect([...tooltipEntries[4].classList]).to.not.include('tooltip-group-header');
        expect(tooltipEntries[4].textContent).to.contain('series1');
        expect([...tooltipEntries[5].classList]).to.not.include('tooltip-group-header');
        expect(tooltipEntries[5].textContent).to.contain('series4');

        // separator before seconds group
        expect([...tooltipEntries[6].classList]).to.include('tooltip-series-separator');

        // second group header, with sum
        expect([...tooltipEntries[7].classList]).to.include('tooltip-group-header');
        expect(tooltipEntries[7].textContent).to.contain('group2');
        expect(tooltipEntries[7].textContent).to.contain('15 bytes');

        // seconds group series
        expect([...tooltipEntries[8].classList]).to.not.include('tooltip-group-header');
        expect(tooltipEntries[8].textContent).to.contain('series2');
        expect([...tooltipEntries[9].classList]).to.not.include('tooltip-group-header');
        expect(tooltipEntries[9].textContent).to.contain('series5');

        // separator before third group
        expect([...tooltipEntries[10].classList]).to.include('tooltip-series-separator');

        // third group series (there is no header)
        expect([...tooltipEntries[11].classList]).to.not.include('tooltip-group-header');
        expect(tooltipEntries[11].textContent).to.contain('series6');
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
