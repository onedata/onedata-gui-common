export default {
  validationErrors: {
    seriesNameEmpty: 'Series has no name.',
    seriesAxisNotAssigned: 'Series "{{element.name}}" has no axis assigned.',
    seriesGroupNameEmpty: 'Series group has no name.',
    axisNameEmpty: 'Axis has no name.',
    axisMinIntervalInvalid: 'Axis "{{element.name}}" has invalid minimum value interval.',
  },
  validationErrorsBatch: {
    message: '{{firstError}} <em>(and {{otherErrorsCount}} more {{errorsNoun}})</em>',
    errorNounSingular: 'error',
    errorNounPlural: 'errors',
  },
  namePlaceholder: 'Unnamed',
};
