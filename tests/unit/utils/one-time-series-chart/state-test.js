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
          valueTransformer: (value) => value + ' bytes',
        }, {
          name: 'axis2',
          minInterval: null,
          valueTransformer: (value) => value + ' bits',
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
          showSeriesSum: false,
          subgroups: [],
        }, {
          id: 'group2',
          stack: false,
          showSeriesSum: false,
          subgroups: [],
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
        className: 'chart-tooltip',
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
            valueTransformer: (value) => value + ' bytes',
          }, {
            id: 'a2',
            valueTransformer: (value) => value + ' bits',
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
            valueTransformer: () => '<span class="value-injection"></span>',
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
            valueTransformer: (value) => value + ' bytes',
          }],
          seriesGroups: [{
            id: 'g1',
            name: 'group1',
            stack: false,
            showSeriesSum: false,
            subgroups: [],
          }, {
            id: 'g2',
            name: 'group2',
            stack: false,
            showSeriesSum: true,
            subgroups: [],
          }, {
            id: 'g3',
            stack: false,
            showSeriesSum: false,
            subgroups: [],
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
        expect(tooltipEntries).to.have.length(8);

        // separator after header
        expect(tooltipEntries[0].matches('.tooltip-series-separator')).to.be.true;
        expect(tooltipEntries[1].matches('.tooltip-series-group')).to.be.true;
        expect(tooltipEntries[2].matches('.tooltip-series-separator')).to.be.true;
        expect(tooltipEntries[3].matches('.tooltip-series-group')).to.be.true;
        expect(tooltipEntries[4].matches('.tooltip-series-separator')).to.be.true;
        expect(tooltipEntries[5].matches('.tooltip-series-group')).to.be.true;
        expect(tooltipEntries[6].matches('.tooltip-series-separator')).to.be.true;
        expect(tooltipEntries[7].matches('.tooltip-series-group')).to.be.true;

        // ungrouped series
        expect(tooltipEntries[1].children).to.have.length(1);
        expect(tooltipEntries[1].children[0].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[1].children[0].textContent).to.match(/series3\s+7 bytes/);

        // first group, without sum
        expect(tooltipEntries[3].children).to.have.length(3);
        expect(tooltipEntries[3].children[0].matches('.tooltip-series-group-header'))
          .to.be.true;
        expect(tooltipEntries[3].children[0].textContent).to.match(/group1/);
        expect(tooltipEntries[3].children[1].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[3].children[1].textContent).to.match(/series1\s+5 bytes/);
        expect(tooltipEntries[3].children[2].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[3].children[2].textContent).to.match(/series4\s+8 bytes/);

        // second group, with sum
        expect(tooltipEntries[5].children).to.have.length(3);
        expect(tooltipEntries[5].children[0].matches('.tooltip-series-group-header'))
          .to.be.true;
        expect(tooltipEntries[5].children[0].textContent).to.match(/group2\s+15 bytes/);
        expect(tooltipEntries[5].children[1].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[5].children[1].textContent).to.match(/series2\s+6 bytes/);
        expect(tooltipEntries[5].children[2].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[5].children[2].textContent).to.match(/series5\s+9 bytes/);

        // third group, without header
        expect(tooltipEntries[7].children).to.have.length(1);
        expect(tooltipEntries[7].children[0].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[7].children[0].textContent).to.match(/series6\s+10 bytes/);
      });

    it('creates tooltip formatter which allows nested series groups',
      function () {
        const state = new State({
          xAxis: {
            timestamps: [],
            timestampFormatter: (value) => value + 's',
          },
          yAxes: [{
            id: 'a1',
            valueTransformer: (value) => value + ' bytes',
          }],
          seriesGroups: [{
            id: 'g1',
            name: 'group1',
            stack: false,
            showSeriesSum: true,
            subgroups: [{
              id: 'g11',
              name: 'group11',
              stack: false,
              showSeriesSum: false,
              subgroups: [],
            }, {
              id: 'g12',
              name: 'group12',
              stack: false,
              showSeriesSum: true,
              subgroups: [],
            }],
          }],
          series: [{
            id: 's1',
            yAxisId: 'a1',
            groupId: 'g1',
            data: [],
          }, {
            id: 's2',
            yAxisId: 'a1',
            groupId: 'g12',
            data: [],
          }, {
            id: 's3',
            yAxisId: 'a1',
            groupId: 'g11',
            data: [],
          }, {
            id: 's4',
            yAxisId: 'a1',
            groupId: 'g12',
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
        }]), 'text/html');

        const tooltipEntries = tooltipDom.querySelectorAll('.tooltip-header ~ *');
        expect(tooltipEntries).to.have.length(2);
        // separator after header
        expect(tooltipEntries[0].matches('.tooltip-series-separator')).to.be.true;

        expect(tooltipEntries[1].matches('.tooltip-series-group')).to.be.true;
        expect(tooltipEntries[1].children).to.have.length(4);
        expect(tooltipEntries[1].children[0].matches('.tooltip-series-group-header')).to.be.true;
        expect(tooltipEntries[1].children[0].textContent).to.match(/group1\s+26 bytes/);
        expect(tooltipEntries[1].children[1].matches('.tooltip-series')).to.be.true;
        expect(tooltipEntries[1].children[1].textContent).to.match(/series1\s+5 bytes/);

        const firstSubgroup = tooltipEntries[1].children[2];
        expect(firstSubgroup.matches('.tooltip-series-group')).to.be.true;
        expect(firstSubgroup.children).to.have.length(2);
        expect(firstSubgroup.children[0].matches('.tooltip-series-group-header')).to.be.true;
        expect(firstSubgroup.children[0].textContent).to.match(/group11\s+$/);
        expect(firstSubgroup.children[1].matches('.tooltip-series')).to.be.true;
        expect(firstSubgroup.children[1].textContent).to.match(/series3\s+7 bytes/);

        const secondSubgroup = tooltipEntries[1].children[3];
        expect(secondSubgroup.matches('.tooltip-series-group')).to.be.true;
        expect(secondSubgroup.children).to.have.length(3);
        expect(secondSubgroup.children[0].matches('.tooltip-series-group-header')).to.be.true;
        expect(secondSubgroup.children[0].textContent).to.match(/group12\s+14 bytes/);
        expect(secondSubgroup.children[1].matches('.tooltip-series')).to.be.true;
        expect(secondSubgroup.children[1].textContent).to.match(/series2\s+6 bytes/);
        expect(secondSubgroup.children[2].matches('.tooltip-series')).to.be.true;
        expect(secondSubgroup.children[2].textContent).to.match(/series4\s+8 bytes/);
      });

    it('stacks series in nested groups when needed', function () {
      const state = new State({
        xAxis: {
          timestamps: [],
          timestampFormatter: (value) => value + 's',
        },
        yAxes: [{
          id: 'a1',
          valueTransformer: (value) => value + ' bytes',
        }],
        seriesGroups: [{
          id: 'g1',
          name: 'group1',
          stack: true,
          showSeriesSum: false,
          subgroups: [{
            id: 'g11',
            name: 'group11',
            stack: false,
            showSeriesSum: false,
            subgroups: [],
          }],
        }, {
          id: 'g2',
          name: 'group2',
          stack: false,
          showSeriesSum: false,
          subgroups: [{
            id: 'g21',
            name: 'group21',
            stack: true,
            showSeriesSum: false,
            subgroups: [],
          }],
        }, {
          id: 'g3',
          name: 'group2',
          stack: false,
          showSeriesSum: false,
          subgroups: [{
            id: 'g31',
            name: 'group31',
            stack: false,
            showSeriesSum: false,
            subgroups: [],
          }],
        }],
        series: [{
          id: 's1',
          yAxisId: 'a1',
          groupId: 'g1',
          data: [],
        }, {
          id: 's2',
          yAxisId: 'a1',
          groupId: 'g11',
          data: [],
        }, {
          id: 's3',
          yAxisId: 'a1',
          groupId: 'g2',
          data: [],
        }, {
          id: 's4',
          yAxisId: 'a1',
          groupId: 'g21',
          data: [],
        }, {
          id: 's5',
          yAxisId: 'a1',
          groupId: 'g3',
          data: [],
        }, {
          id: 's6',
          yAxisId: 'a1',
          groupId: 'g31',
          data: [],
        }],
      });
      const echartState = state.asEchartState();

      const series = echartState.series;
      expect(series[0].id).to.equal('s2');
      expect(series[0].stack).to.equal('g1');
      expect(series[1].id).to.equal('s1');
      expect(series[1].stack).to.equal('g1');
      expect(series[2].id).to.equal('s3');
      expect(series[2].stack).to.be.null;
      expect(series[3].id).to.equal('s4');
      expect(series[3].stack).to.equal('g21');
      expect(series[4].id).to.equal('s5');
      expect(series[4].stack).to.be.null;
      expect(series[5].id).to.equal('s6');
      expect(series[5].stack).to.be.null;
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
