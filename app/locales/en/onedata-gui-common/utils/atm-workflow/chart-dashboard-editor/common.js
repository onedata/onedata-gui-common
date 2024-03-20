export default {
  validationErrors: {
    seriesNameEmpty: 'Series has no name.',
    seriesAxisNotAssigned: 'Series "{{element.name}}" has no axis assigned.',
    seriesGroupNameEmpty: 'Series group has no name.',
    axisNameEmpty: 'Axis has no name.',
    axisMinIntervalInvalid: 'Axis "{{element.name}}" has invalid minimum value interval.',
    chartFunctionUndefinedReturnType: 'The result of the "{{placeholders.functionName}}" function has an ambiguous type. Adjust its attached functions to fix this issue.',
    chartFunctionWrongArgumentTypeAssigned: 'The "{{placeholders.argumentName}}" argument of the "{{placeholders.functionName}}" function has an unsuitable type. It requires a {{placeholders.compatibleTypes}} as an input. Adjust its attached functions to fix this issue.',
    chartFunctionEmptyArgument: 'The "{{placeholders.argumentName}}" argument of the "{{placeholders.functionName}}" function has no function attached.',
    chartFunctionDetached: 'The "{{placeholders.functionName}}" function is not attached.',
    storeNotAssigned: 'Store is not assigned.',
    timeSeriesNameGeneratorNotAssigned: 'Time series name generator is not assigned.',
    invalidTimeSeriesName: 'Time series name is invalid.',
    invalidTimeSeriesMetrics: 'Selected time series metrics are invalid.',
    chartFunctionParameterInvalid: '"{{placeholders.parameterName}}" parameter of "{{placeholders.functionName}}" function is invalid.',
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
