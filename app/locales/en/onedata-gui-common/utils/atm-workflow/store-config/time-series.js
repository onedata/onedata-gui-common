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
      fiveSeconds: '5 sec',
      minute: '1 min',
      hour: '1 h',
      day: '1 day',
      week: '1 week',
      month: '1 mo',
      year: '1 year',
      infinity: 'Inf',
    },
  },
  metricAggregators: {
    sum: 'Sum',
    max: 'Maximum',
    min: 'Minimum',
    first: 'First',
    last: 'Last',
  },
};
