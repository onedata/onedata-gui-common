import logEntryDetails from './audit-log-browser/log-entry-details';

export default {
  logEntryDetails,
  columnHeaders: {
    timestamp: 'Time',
    severity: 'Severity',
  },
  noLogEntries: 'No log entries.',
  noLogEntriesTip: 'Empty log means that either no events were ever recorded or the recorded events have already expired, since all audit logs are subject to expiration.',
};
