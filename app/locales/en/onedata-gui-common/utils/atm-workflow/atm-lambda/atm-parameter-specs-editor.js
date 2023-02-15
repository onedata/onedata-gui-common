export default {
  entry: {
    entryName: {
      label: 'Name',
      placeholder: 'Name',
      errors: {
        notUnique: 'This field must have a unique value',
        reserved: 'This name is reserved',
      },
    },
    entryIsOptional: {
      label: 'Optional',
    },
    entryDefaultValue: {
      label: 'Default value',
      valueCreatorButtonLabel: 'Set default value',
    },
  },
};
