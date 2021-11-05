export default {
  fields: {
    name: {
      label: 'Name',
    },
    maxRetries: {
      label: 'Max. retries',
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
      strategy: {
        label: 'Strategy',
        options: {
          serial: {
            label: 'Serial',
          },
          batch: {
            label: 'Batch',
          },
        },
      },
      batchOptions: {
        batchSize: {
          label: 'Batch size',
        },
      },
    },
  },
};
