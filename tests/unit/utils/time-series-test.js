import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  getTimeSeriesMetricNamesWithAggregator
} from 'onedata-gui-common/utils/time-series';

describe('Unit | Utility | time series', function () {
  describe('getTimeSeriesMetricNamesWithAggregator', function () {
    it('returns metric names having specific aggregator, sorted by resolution ascending', function () {
      const result = getTimeSeriesMetricNamesWithAggregator({
        metrics: {
          sumHour: { aggregator: 'sum', resolution: 3600 },
          sumInfinity: { aggregator: 'sum', resolution: 0 },
          sumMinute: { aggregator: 'sum', resolution: 60 },
          lastMinute: { aggregator: 'last', resolution: 60 },
        },
      }, 'sum');

      expect(result).to.deep.equal(['sumMinute', 'sumHour']);
    });

    it('returns metric names including infinity metric, when "allowInfinityResolution" option is true',
      function () {
        const result = getTimeSeriesMetricNamesWithAggregator({
          metrics: {
            sumHour: { aggregator: 'sum', resolution: 3600 },
            sumInfinity: { aggregator: 'sum', resolution: 0 },
            sumMinute: { aggregator: 'sum', resolution: 60 },
            lastMinute: { aggregator: 'last', resolution: 60 },
          },
        }, 'sum', { allowInfinityResolution: true });

        expect(result).to.deep.equal(['sumMinute', 'sumHour', 'sumInfinity']);
      }
    );

    it('returns empty array when passed time series schema is empty', function () {
      const result = getTimeSeriesMetricNamesWithAggregator(
        null, 'sum', { allowInfinityResolution: true }
      );

      expect(result).to.deep.equal([]);
    });
  });
});
