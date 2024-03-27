export default {
  fields: {
    name: {
      label: 'Name',
    },
    unitName: {
      label: 'Unit',
      options: {
        custom: {
          label: 'Custom',
        },
      },
    },
    bytesUnitOptions: {
      label: 'Unit options',
      format: {
        label: 'Format',
      },
    },
    customUnitOptions: {
      label: 'Unit options',
      customName: {
        label: 'Name',
      },
      useMetricSuffix: {
        label: 'Use metric suffix',
      },
    },
    minInterval: {
      label: 'Minimum value interval',
      placeholder: 'Auto',
      tip: 'Defines what is the minimal value step on the axis. Example: when set to "1", it will show only integer values.',
    },
  },
};
