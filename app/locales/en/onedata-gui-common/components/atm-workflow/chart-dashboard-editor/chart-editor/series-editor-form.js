export default {
  fields: {
    repeatPerPrefixedTimeSeries: {
      label: 'Repeat per prefixed time series',
      tip: 'When enabled, this series will be repeated for every instance of time series that share the same name prefix. This way, a dynamic number of series of the same kind can be presented.',
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
      tip: 'You may assign a group to gather series that belong to the same category. As a result, all series in a group will be nested under the group\'s name in the chart\'s popover that shows their values for a selected point in time. Grouped series can be plotted in a stacked manner, then their sum is also presented.',
      options: {
        none: {
          label: 'None',
        },
      },
      pathInfo: '(in {{path}})',
    },
  },
};
