import taskResourcesFields from '../../utils/workflow-visualiser/task-resources-fields';

export default {
  fields: {
    atmLambda: {
      label: 'Used lambda',
      atmLambdaName: {
        label: 'Name',
      },
      atmLambdaRevisionNumber: {
        label: 'Revision',
      },
      atmLambdaSummary: {
        label: 'Summary',
      },
    },
    details: {
      label: 'Task details',
      schemaId: {
        label: 'ID',
      },
      name: {
        label: 'Name',
      },
    },
    argumentMappings: {
      label: 'Arguments',
      argumentMapping: {
        valueBuilderType: {
          label: 'Value builder',
          options: {
            __leaveUnassigned: {
              label: 'Leave unassigned',
            },
            iteratedItem: {
              label: 'Iterated item',
            },
            const: {
              label: 'Constant value',
            },
            singleValueStoreContent: {
              label: 'Store content',
            },
          },
        },
        valueBuilderConstValue: {
          label: 'Value',
        },
        valueBuilderStore: {
          label: 'Store',
          options: {
            __createStore: {
              label: 'Create store...',
            },
          },
        },
      },
    },
    resultMappings: {
      label: 'Results',
      singleResult: {
        singleResultMappings: {
          addButtonText: 'Add mapping',
          emptyCollectionViewModeText: 'Not assigned.',
          singleResultMapping: {
            targetStore: {
              label: 'Target store',
              options: {
                __createStore: {
                  label: 'Create store...',
                },
                __taskAuditLog: {
                  label: 'Current task system audit log',
                },
                __workflowAuditLog: {
                  label: 'Workflow system audit log',
                },
                __taskTimeSeries: {
                  label: 'Current task time series store',
                },
              },
              errors: {
                notEnabledTsStoreSelected: 'This store is not enabled. See configuration below',
              },
            },
            dispatchFunction: {
              label: 'Dispatch function',
              options: {
                append: {
                  label: 'Append',
                },
                extend: {
                  label: 'Extend',
                },
              },
            },
          },
        },
      },
    },
    timeSeriesStoreSection: {
      label: 'Time series store',
      createTimeSeriesStore: {
        label: 'Create time series store',
      },
    },
    resources: {
      label: 'Resources',
      overrideResources: {
        label: 'Override default resources',
      },
      resourcesSections: taskResourcesFields,
    },
  },
};
