export default {
  functions: {
    abs: {
      name: 'Absolute value',
      arguments: {
        data: 'Data',
      },
      tip: 'Converts any negative value into its positive counterpart.',
    },
    axisOutput: {
      name: 'Use as a label',
      arguments: {
        data: 'Data',
      },
      tip: '',
    },
    currentValue: {
      name: 'Current value',
      tip: 'The value for which the label is being calculated.',
    },
    literal: {
      name: 'Constant',
      parameters: {
        data: 'Value',
      },
      tip: 'Returns a constant value. It does not do any transformation of the time series but might work as a value source for other functions (like "Multiply").',
    },
    loadSeries: {
      name: 'Load series',
      tip: 'Returns a specific time series from a time series store.',
    },
    loadRepeatedSeries: {
      name: 'Load repeated series',
      tip: 'Returns time series for which the current chart series will be repeated. It\'s available only when the "Repeat per prefixed time series" series option is enabled.',
    },
    multiply: {
      name: 'Multiply',
      arguments: {
        operands: 'Operands',
      },
      tip: 'Returns a result of the multiplication of all output values of the attached functions.',
    },
    rate: {
      name: 'Rate',
      arguments: {
        data: 'Data',
      },
      parameters: {
        timeSpan: 'Time span',
      },
      tip: 'Converts values into their rate within a time window. Example: converts MiB into MiB/s.',
    },
    replaceEmpty: {
      name: 'Replace empty',
      arguments: {
        data: 'Data',
      },
      tip: 'Replaces empty series points with a particular value.',
    },
    seriesOutput: {
      name: 'Show result',
      arguments: {
        data: 'Data',
      },
      tip: '',
    },
    timeDerivative: {
      name: 'Time derivative',
      arguments: {
        data: 'Data',
      },
      parameters: {
        timeSpan: 'Time span',
      },
      tip: 'Calculates the time derivative of values in a particular time window. The result will be a difference between two adjacent points divided by their time difference.',
    },
  },
};
