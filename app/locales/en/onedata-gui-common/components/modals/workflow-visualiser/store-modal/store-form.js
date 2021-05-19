export default {
  fields: {
    name: {
      label: 'Name',
    },
    description: {
      label: 'Description (optional)',
    },
    type: {
      label: 'Type',
      options: {
        list: {
          label: 'List',
        },
        map: {
          label: 'Map',
        },
        treeForest: {
          label: 'Tree forest',
        },
        singleValue: {
          label: 'Single value',
        },
        range: {
          label: 'Range',
        },
        histogram: {
          label: 'Histogram',
        },
        auditLog: {
          label: 'Audit log',
        },
      },
    },
    genericStoreConfig: {
      dataType: {
        label: 'Data type',
        options: {
          integer: {
            label: 'Integer',
          },
          string: {
            label: 'String',
          },
          object: {
            label: 'Object',
          },
          histogram: {
            label: 'Histogram',
          },
          anyFile: {
            label: 'Any file',
          },
          regularFile: {
            label: 'Regular file',
          },
          directory: {
            label: 'Directory',
          },
          dataset: {
            label: 'Dataset',
          },
          archive: {
            label: 'Archive',
          },
          singleValueStore: {
            label: 'Single value store cred.',
          },
          listStore: {
            label: 'List store cred.',
          },
          mapStore: {
            label: 'Map store cred.',
          },
          treeForestStore: {
            label: 'Tree forest store cred.',
          },
          rangeStore: {
            label: 'Range store cred.',
          },
          histogramStore: {
            label: 'Histogram store cred.',
          },
          onedatafsCredentials: {
            label: 'OnedataFS credentials',
          },
        },
      },
      defaultValue: {
        label: 'Default value',
      },
    },
    rangeStoreConfig: {
      rangeStart: {
        label: 'Range start',
        errors: {
          gteEndForPositiveStep: 'This field must be less than the range end when the range step is positive',
          lteEndForNegativeStep: 'This field must be greater than the range end when the range step is negative',
        },
      },
      rangeEnd: {
        label: 'Range end',
        errors: {
          lteStartForPositiveStep: 'This field must be greater than the range start when the range step is positive',
          gteStartForPositiveStep: 'This field must be less than the range start when the range step is negative',
        },
      },
      rangeStep: {
        label: 'Range step',
      },
    },
  },
};
