export default {
  fields: {
    label: 'Measurement specifications',
    addButtonText: 'Add measurement spec.',
    measurementSpec: {
      nameMatcherType: {
        label: 'Name matcher type',
      },
      nameMatcher: {
        label: 'Name matcher',
      },
      unit: {
        label: 'Unit',
        options: {
          custom: {
            label: 'Custom',
          },
        },
      },
      customUnit: {
        label: 'Custom unit name',
      },
    },
  },
  summary: 'Defined measurements: {{measurementsCount}}',
};
