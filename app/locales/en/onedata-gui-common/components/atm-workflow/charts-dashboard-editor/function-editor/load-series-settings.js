import _ from 'lodash';
import replaceEmptySettings from './replace-empty-settings';

export default _.merge(replaceEmptySettings, {
  missingPointsCollapse: 'Missing points options',
  fields: {
    timeSeriesSelector: {
      collectionRef: {
        label: 'Store',
        sourceLabels: {
          store: 'Store "{{originName}}"',
          task: 'Task "{{originName}}" time series store',
          unknown: 'Unknown',
        },
      },
      timeSeriesNameGenerator: {
        label: 'Time series name generator',
      },
      timeSeriesName: {
        label: 'Time series name',
        placeholder: 'Example: {{nameGenerator}}123',
      },
      metricNames: {
        label: 'Metrics',
      },
    },
  },
});
