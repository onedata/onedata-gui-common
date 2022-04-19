export default {
  nameGeneratorTypes: {
    exact: 'Exact',
    addPrefix: 'Add prefix',
  },
  metricResolutions: {
    standard: {
      fiveSeconds: '5 seconds',
      minute: '1 minute',
      hour: '1 hour',
      day: '1 day',
      week: '1 week',
      month: '1 month',
      year: '1 year',
      infinity: 'Infinity',
    },
    short: {
      fiveSeconds: '5s',
      minute: '1m',
      hour: '1h',
      day: '1d',
      week: '1w',
      month: '1mo',
      year: '1y',
      infinity: 'Inf',
    },
  },
  metricAggregators: {
    standard: {
      sum: 'Sum',
      max: 'Maximum',
      min: 'Minimum',
      first: 'First',
      last: 'Last',
    },
    short: {
      sum: 'Sum',
      max: 'Max',
      min: 'Min',
      first: 'First',
      last: 'Last',
    },
  },
};
