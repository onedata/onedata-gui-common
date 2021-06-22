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
            onedatafsCredentials: {
              label: 'OnedataFS credentials',
            },
          },
        },
        valueBuilderConstValue: {
          label: 'Value',
        },
        // TODO: VFS-7816 uncomment or remove future code
        // valueBuilderStore: {
        //   label: 'Store',
        // },
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
  },
};
