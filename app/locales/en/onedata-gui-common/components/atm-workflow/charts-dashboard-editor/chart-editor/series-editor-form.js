export default {
  fields: {
    repeatPerPrefixedTimeSeries: {
      label: 'Repeat per prefixed time series',
    },
    timeSeriesSelector: {
      label: 'Prefixed time series',
    },
    name: {
      label: 'Name',
    },
    type: {
      label: 'Type',
    },
    colorType: {
      label: 'Color',
      options: {
        auto: {
          label: 'auto',
        },
        custom: {
          label: 'custom',
        },
      },
    },
    customColor: {
      label: 'Custom color',
    },
    axis: {
      label: 'Axis',
    },
    group: {
      label: 'Group',
      options: {
        none: {
          label: 'None',
        },
      },
      pathInfo: '(in {{path}})',
    },
  },
};
