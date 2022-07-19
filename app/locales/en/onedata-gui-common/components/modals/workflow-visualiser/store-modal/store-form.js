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
      defaultValue: {
        label: 'Default value',
      },
    },
    rangeStoreConfig: {
      rangeStart: {
        label: 'Range start',
        errors: {
          gtEndForPositiveStep: 'This field must be less than or equal to the range end when the range step is positive',
          ltEndForNegativeStep: 'This field must be greater than or equal to the range end when the range step is negative',
        },
      },
      rangeEnd: {
        label: 'Range end',
        errors: {
          ltStartForPositiveStep: 'This field must be greater than or equal to the range start when the range step is positive',
          gtStartForPositiveStep: 'This field must be less than or equal to the range start when the range step is negative',
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
