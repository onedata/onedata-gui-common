import Component from '@ember/component';
import { EntrySeverity } from 'onedata-gui-common/utils/audit-log';

const allSeverities = Object.values(EntrySeverity);

export default Component.extend({
  onFetchLogEntries: async (listingParams) => {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    let startTimestamp = typeof listingParams.index === 'string' ?
      Number(listingParams.index) : nowTimestamp;
    if (typeof listingParams.offset === 'number') {
      // We subtract offset instead of adding it because listing is timestamp-reversed
      // (newest are at the top = first entry has the biggest timestamp)
      startTimestamp -= listingParams.offset;
    }

    const entries = [];
    for (let i = 0; i < listingParams.limit; i++) {
      if (startTimestamp - i > nowTimestamp) {
        continue;
      }
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
