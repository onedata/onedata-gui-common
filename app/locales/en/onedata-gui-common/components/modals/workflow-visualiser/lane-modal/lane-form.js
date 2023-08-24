export default {
  fields: {
    name: {
      label: 'Name',
    },
    maxRetries: {
      label: 'Max. retries',
    },
    instantFailureExceptionThreshold: {
      label: 'Instant failure exception threshold',
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
