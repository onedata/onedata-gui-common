export default {
  start: {
    label: 'Start',
    errors: {
      gtEndForPositiveStep: 'This field must be less than or equal to the range end when the range step is positive',
      ltEndForNegativeStep: 'This field must be greater than or equal to the range end when the range step is negative',
    },
  },
  end: {
    label: 'End',
    errors: {
      ltStartForPositiveStep: 'This field must be greater than or equal to the range start when the range step is positive',
      gtStartForPositiveStep: 'This field must be less than or equal to the range start when the range step is negative',
    },
  },
  step: {
    label: 'Step',
  },
};
