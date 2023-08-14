export default {
  fields: {
    name: {
      label: 'Name',
    },
    maxRetries: {
      label: 'Max. retries',
    },
    failForExceptionsRatio: {
      label: 'Fail for exception ratio',
    },
    iteratorOptions: {
      label: 'Iterator options',
      sourceStore: {
        label: 'Source store',
        options: {
          __createStore: {
            label: 'Create store...',
          },
        },
      },
      maxBatchSize: {
        label: 'Max. batch size',
      },
    },
  },
};
