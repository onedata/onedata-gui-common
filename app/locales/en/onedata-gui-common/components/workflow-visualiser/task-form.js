import taskResourcesFields from '../../utils/workflow-visualiser/task-resources-fields';

export default {
  usedLambdaHeader: 'Used lambda',
  taskDetailsHeader: 'Task details',
  fields: {
    name: {
      label: 'Name',
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
            // TODO: VFS-7816 uncomment or remove future code
            // storeCredentials: {
            //   label: 'Store credentials',
            // },
            singleValueStoreContent: {
              label: 'Store content',
            },
            onedatafsCredentials: {
              label: 'OnedataFS credentials',
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
      resultMapping: {
        targetStore: {
          label: 'Target store',
          options: {
            __leaveUnassigned: {
              label: 'Leave unassigned',
            },
            __createStore: {
              label: 'Create store...',
            },
            __taskAuditLog: {
              label: 'Current task system audit log',
            },
            __workflowAuditLog: {
              label: 'Workflow system audit log',
            },
          },
        },
        dispatchFunction: {
          label: 'Dispatch function',
          options: {
            // TODO: VFS-7816 uncomment or remove future code
            // add: {
            //   label: 'Add',
            // },
            // remove: {
            //   label: 'Remove',
            // },
            append: {
              label: 'Append',
            },
            // TODO: VFS-7816 uncomment or remove future code
            // prepend: {
            //   label: 'Prepend',
            // },
            set: {
              label: 'Set',
            },
          },
        },
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
