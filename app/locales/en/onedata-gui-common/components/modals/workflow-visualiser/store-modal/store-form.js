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
        // TODO: VFS-7816 uncomment or remove future code
        // map: {
        //   label: 'Map',
        // },
        treeForest: {
          label: 'Tree forest',
        },
        singleValue: {
          label: 'Single value',
        },
        range: {
          label: 'Range',
        },
        // TODO: VFS-7816 uncomment or remove future code
        // histogram: {
        //   label: 'Histogram',
        // },
        // auditLog: {
        //   label: 'Audit log',
        // },
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
          // TODO: VFS-7816 uncomment or remove future code
          // histogram: {
          //   label: 'Histogram',
          // },
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
          // TODO: VFS-7816 uncomment or remove future code
          // archive: {
          //   label: 'Archive',
          // },
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
