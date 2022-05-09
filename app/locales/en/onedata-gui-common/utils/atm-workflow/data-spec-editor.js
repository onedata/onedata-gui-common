import valueConstraintsEditors from './data-spec-editor/value-constraints-editors';

export default {
  valueConstraintsEditors,
  fields: {
    type: {
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
        timeSeriesMeasurement: {
          label: 'Time series measurement',
        },
        onedatafsCredentials: {
          label: 'OnedataFS credentials',
        },
      },
    },
  },
};
