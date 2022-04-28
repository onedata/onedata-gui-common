import valueConstraintsEditor from './data-spec-editor/value-constraints-editor';

export default {
  valueConstraintsEditor,
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
        onedatafsCredentials: {
          label: 'OnedataFS credentials',
        },
        timeSeriesMeasurement: {
          label: 'Time series measurement',
        },
      },
    },
  },
};
