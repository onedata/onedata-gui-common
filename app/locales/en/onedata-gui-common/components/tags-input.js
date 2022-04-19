export default {
  clearBtn: 'Clear input',
  disabledCreateTriggerTip: {
    limitReached: 'Maximum number of elements has been reached.',
  },
  modelSelectorEditor: {
    modelTypes: {
      user: 'User',
      group: 'Group',
      provider: 'Oneprovider',
      service: 'Service',
      serviceOnepanel: 'Service Onepanel',
    },
    view: {
      list: 'List',
      byId: 'By ID',
    },
    recordsFilterPlaceholder: 'Filter...',
    allRecord: {
      user: 'Any user',
      group: 'Any group',
      provider: 'Any Oneprovider',
      service: 'Any Oneprovider',
      serviceOnepanel: 'Any Oneprovider Onepanel',
    },
    allRecordTip: {
      user: 'Any user that has an account in Onezone',
      group: 'Any user that has at least one group',
    },
    allRecordsAdded: {
      user: 'All users are already added.',
      group: 'All groups are already added.',
      provider: 'All Oneproviders are already added.',
      service: 'All services are already added.',
      serviceOnepanel: 'All Onepanels are already added.',
    },
    idLabel: {
      user: 'User ID',
      group: 'Group ID',
      provider: 'Oneprovider ID',
      service: 'Oneprovider ID',
      serviceOnepanel: 'Oneprovider ID',
    },
    addId: 'Add ID',
  },
  timeSeriesMetricEditor: {
    tag: {
      unknownId: 'Unknown ID',
      retention: '{{retention}} samp.',
    },
    view: {
      presets: 'Presets',
      custom: 'Custom',
    },
    allPresetsUsed: 'All presets are already used.',
    disabled: {
      equivalentExists: 'Metric with the same resolution already exists',
      idExists: 'Metric with the same ID already exists',
    },
    customMetricFields: {
      id: {
        label: 'ID',
        errors: {
          notUnique: 'This ID is already used',
        },
      },
      resolution: {
        label: 'Resolution',
        errors: {
          notUnique: 'This resolution is already used for selected aggregator',
        },
      },
      retention: {
        label: 'Retention',
      },
    },
    submitCustomMetric: 'Add',
  },
};
