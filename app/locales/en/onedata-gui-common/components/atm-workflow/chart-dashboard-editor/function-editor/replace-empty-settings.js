export default {
  fields: {
    fallbackValue: {
      label: 'Replace missing points with',
    },
    usePreviousStrategy: {
      label: 'Use previous value if exists',
      tip: 'When enabled, any empty point will be replaced with the value of the nearest previous point. If it does not exist, the standard fallback value will be used.',
    },
  },
};
