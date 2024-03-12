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
    },
  },
};
