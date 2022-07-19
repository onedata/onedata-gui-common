export default {
  fields: {
    timeSeriesSchemas: {
      label: 'Time series schemas',
      addButtonText: 'Add time series',
      timeSeriesSchema: {
        nameGeneratorType: {
          label: 'Name generator type',
        },
        nameGenerator: {
          label: 'Name generator',
          errors: {
            notUnique: 'This field must be uniquely prefixed across all generators',
          },
        },
        unit: {
          label: 'Unit',
        },
        customUnit: {
          label: 'Custom unit name',
        },
        metrics: {
          label: 'Metrics',
        },
      },
    },
    dashboardSpec: {
      label: 'Charts dashboard',
    },
  },
};
