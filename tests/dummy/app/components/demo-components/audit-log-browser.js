import Component from '@ember/component';
import { EntrySeverity } from 'onedata-gui-common/utils/audit-log';

const allSeverities = Object.values(EntrySeverity);

export default Component.extend({
  onFetchEntries: async (listingParams) => {
    let startTimestamp = typeof listingParams.index === 'string' ?
      Number(listingParams.index) : Math.floor(Date.now() / 1000);
    if (typeof listingParams.offset === 'number') {
      startTimestamp += listingParams.offset;
    }

    const entries = [];
    for (let i = 0; i < listingParams.limit; i++) {
      entries.push(generateLogEntry(startTimestamp - i));
    }

    return {
      logEntries: entries,
      isLast: false,
    };
  },

  customColumnHeaders: Object.freeze([{
    classNames: 'description-column-header',
    content: 'Description',
  }, {
    classNames: 'state-column-header',
    content: 'State',
  }]),

  isTimestampRoundedToSeconds: false,

  isSeverityColumnVisible: false,
});

function generateLogEntry(timestampSeconds) {
  return {
    index: String(timestampSeconds),
    timestamp: timestampSeconds * 1000 + 500,
    source: 'system',
    severity: allSeverities[timestampSeconds % allSeverities.length],
    content: {
      description: `Description for ${timestampSeconds}`,
      state: timestampSeconds % 2 ? 'Ok' : 'Not ok',
    },
  };
}
