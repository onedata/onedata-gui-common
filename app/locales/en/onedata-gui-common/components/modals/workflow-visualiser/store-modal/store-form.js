export default {
  fields: {
    id: {
      label: 'ID',
    },
    instanceId: {
      label: 'Instance ID',
    },
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
        treeForest: {
          label: 'Tree forest',
        },
        singleValue: {
          label: 'Single value',
        },
        range: {
          label: 'Range',
        },
        auditLog: {
          label: 'Audit log',
        },
        timeSeries: {
          label: 'Time series',
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
          anyFile: {
            label: 'Any file',
          },
          regularFile: {
            label: 'Regular file',
          },
          directory: {
            label: 'Directory',
          },
          symlink: {
            label: 'Symbolic link',
          },
          dataset: {
            label: 'Dataset',
          },
          range: {
            label: 'Range',
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
    needsUserInput: {
      label: 'Needs user input',
    },
  },
};
