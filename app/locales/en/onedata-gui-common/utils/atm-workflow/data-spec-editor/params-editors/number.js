export default {
  fields: {
    integersOnly: {
      label: 'Integers only',
    },
    allowedValues: {
      label: 'Allowed values',
      valueCreatorButtonLabel: 'Set allowed values',
    },
  },
  summary: {
    base: 'Allowed numbers: {{allowedNumbers}}',
    allowedNumbers: {
      any: 'Any',
      integersOnly: 'Integers',
      none: 'None',
    },
  },
};
