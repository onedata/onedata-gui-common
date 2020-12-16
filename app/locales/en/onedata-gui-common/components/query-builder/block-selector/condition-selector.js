const commonComparators = {
  eq: '=',
  lt: '&lt;',
  lte: '≤',
  gt: '&gt;',
  gte: '≥',
};

export default {
  propertySelectorPlaceholder: 'Choose property...',
  comparators: {
    string: {
      eq: '=',
    },
    number: commonComparators,
    mixed: commonComparators,
    stringOptions: {
      eq: '=',
    },
    numberOptions: commonComparators,
    mixedOptions: commonComparators,
    // FIXME: cannot be in common
    storage: {
      is: 'is',
    },
    provider: {
      is: 'is',
    },
  },
  acceptCondition: 'Add',
};
