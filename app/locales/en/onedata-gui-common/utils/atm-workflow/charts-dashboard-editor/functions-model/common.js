export default {
  functions: {
    abs: {
      name: 'Absolute value',
      arguments: {
        data: 'Data',
      },
    },
    axisOutput: {
      name: 'Use as a label',
      arguments: {
        data: 'Data',
      },
    },
    currentValue: {
      name: 'Current value',
    },
    literal: {
      name: 'Constant',
      parameters: {
        data: 'Value',
      },
    },
    loadSeries: {
      name: 'Load series',
    },
    loadRepeatedSeries: {
      name: 'Load repeated series',
    },
    multiply: {
      name: 'Multiply',
      arguments: {
        operands: 'Operands',
      },
    },
    rate: {
      name: 'Rate',
      arguments: {
        data: 'Data',
      },
      parameters: {
        timeSpan: 'Time span',
      },
    },
    replaceEmpty: {
      name: 'Replace empty',
      arguments: {
        data: 'Data',
      },
    },
    seriesOutput: {
      name: 'Show result',
      arguments: {
        data: 'Data',
      },
    },
    timeDerivative: {
      name: 'Time derivative',
      arguments: {
        data: 'Data',
      },
      parameters: {
        timeSpan: 'Time span',
      },
    },
  },
};
