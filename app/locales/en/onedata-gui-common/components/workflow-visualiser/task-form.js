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
            leaveUnassigned: {
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
  },
};
