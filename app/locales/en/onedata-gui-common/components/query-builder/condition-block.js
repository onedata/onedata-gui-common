const numberComparators = {
  eq: '=',
  lt: '&lt;',
  lte: '≤',
  gt: '&gt;',
  gte: '≥',
};

export default {
  comparators: {
    string: {
      eq: '=',
    },
    number: numberComparators,
    stringOptions: {
      eq: '=',
    },
    numberOptions: numberComparators,
    mixedOptions: numberComparators,
  },
};
