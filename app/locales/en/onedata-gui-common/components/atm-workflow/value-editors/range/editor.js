export default {
  start: {
    label: 'Start',
    // These errors are not rendered as there is no place for such a long text.
    // Exist to have a complete implementation of error handling.
    errors: {
      gtEndForPositiveStep: 'This field must be less than or equal to the range end when the range step is positive',
      ltEndForNegativeStep: 'This field must be greater than or equal to the range end when the range step is negative',
    },
  },
  end: {
    label: 'End',
    // These errors are not rendered as there is no place for such a long text.
    // Exist to have a complete implementation of error handling.
    errors: {
      ltStartForPositiveStep: 'This field must be greater than or equal to the range start when the range step is positive',
      gtStartForPositiveStep: 'This field must be less than or equal to the range start when the range step is negative',
    },
  },
  step: {
    label: 'Step',
  },
};
