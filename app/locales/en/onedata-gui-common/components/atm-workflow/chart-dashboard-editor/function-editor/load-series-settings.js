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
        tip: 'The time series store which works as the data source for the series.',
      },
      timeSeriesNameGenerator: {
        label: 'Time series name generator',
        tip: {
          all: 'The time series generator, referencing a specific time series by its unique name or a dynamically created collection of time series. One of the time series generators defined in the selected time series store configuration.',
          prefixedOnly: 'The time series generator, referencing a collection of dynamically created time series. One of the time series generators defined in the selected time series store configuration.',
        },
      },
      timeSeriesName: {
        label: 'Time series name',
        placeholder: 'Example: {{nameGenerator}}123',
        tip: 'The name is predefined when the time series generator points to a single time series. When a collection of series is selected, then it should contain a specific name of the series.',
      },
      metricNames: {
        label: 'Metrics',
        tip: 'Metrics which should be used to plot the series. Every metric can represent different time resolutions and value aggregation strategies. It\'s important to select metrics with time resolutions matching other time series in the chart.',
      },
    },
  },
});
