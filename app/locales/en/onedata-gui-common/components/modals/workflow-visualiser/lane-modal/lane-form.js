export default {
  fields: {
    name: {
      label: 'Name',
    },
    iteratorOptions: {
      label: 'Iterator options',
      sourceStore: {
        label: 'Source store',
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
