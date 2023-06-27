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
        exception: {
          label: 'Exception',
        },
      },
    },
    defaultValue: {
      label: 'Default value',
    },
    needsUserInput: {
      label: 'Needs user input',
    },
  },
};
