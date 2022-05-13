import tableHeader from './store-content-table/table-header';

export default {
  tableHeader,
  columns: {
    value: 'Value',
    error: 'Error',
    logTime: 'Log time',
    severity: 'Severity',
    description: 'Description',
    rangeStart: 'Start',
    rangeEnd: 'End',
    rangeStep: 'Step',
    timeSeriesMeasurementSeriesName: 'Time series name',
    timeSeriesMeasurementTimestamp: 'Measurement time',
    timeSeriesMeasurementValue: 'Measurement value',
  },
  tableRow: {
    storeAccessError: 'Cannot fetch entry due to error',
    unknownError: 'Unknown error',
    entryExpanderTip: {
      expanded: 'Hide details',
      collapsed: 'Show details',
    },
  },
};
