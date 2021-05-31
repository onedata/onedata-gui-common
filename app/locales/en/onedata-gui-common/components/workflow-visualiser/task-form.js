export default {
  fields: {
    name: {
      label: 'Name',
    },
    argumentMappings: {
      label: 'Arguments',
      argumentMapping: {
        valueBuilderType: {
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
            storeCredentials: {
              label: 'Store credentials',
            },
            onedatafsCredentials: {
              label: 'OnedataFS credentials',
            },
          },
        },
      },
    },
    resultMappings: {
      label: 'Results',
      resultMapping: {
        targetStore: {
          options: {
            __leaveUnassigned: {
              label: 'Leave unassigned',
            },
          },
        },
        dispatchFunction: {
          options: {
            add: {
              label: 'Add',
            },
            remove: {
              label: 'Remove',
            },
            append: {
              label: 'Append',
            },
            prepend: {
              label: 'Prepend',
            },
            set: {
              label: 'Set',
            },
          },
        },
      },
    },
  },
};
