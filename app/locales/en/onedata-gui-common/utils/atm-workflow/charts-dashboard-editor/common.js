export default {
  validationErrors: {
    seriesNameEmpty: 'Series has no name.',
    seriesAxisNotAssigned: 'Series "{{element.name}}" has no axis assigned.',
    seriesGroupNameEmpty: 'Series group has no name.',
    axisNameEmpty: 'Axis has no name.',
    axisMinIntervalInvalid: 'Axis "{{element.name}}" has invalid minimum value interval.',
    chartFunctionUndefinedReturnType: 'The result of "{{placeholders.functionName}}" function has an ambiguous type. Adjust its attached functions to fix this issue.',
    chartFunctionWrongArgumentTypeAssigned: '"{{placeholders.argumentName}}" argument of "{{placeholders.functionName}}" function is of unsuitable type. It requires {{placeholders.compatibleTypes}} as an input. Adjust its attached functions to fix this issue.',
  },
  validationErrorParts: {
    chartFunctionWrongArgumentTypeAssigned: {
      compatibleTypes: {
        number: 'numeric values',
        points: 'time series',
      },
    },
  },
  validationErrorsBatch: {
    message: '{{firstError}} <em>(and {{otherErrorsCount}} more {{errorsNoun}})</em>',
    errorNounSingular: 'error',
    errorNounPlural: 'errors',
  },
  namePlaceholder: 'Unnamed',
  repeatedSeriesName: 'Series repeated for {{generatorName}}',
};
