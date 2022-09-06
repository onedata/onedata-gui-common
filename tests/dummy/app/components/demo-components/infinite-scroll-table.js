import Component from '@ember/component';

export default Component.extend({
  onFetchEntries: async (listingParams) => {
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
      entries.push(generateEntry(startTimestamp - i));
    }

    return {
      entries: entries,
      isLast: false,
    };
  },
});

function generateEntry(index) {
  return {
    index: String(index),
    field1: `field 1 ${index}`,
    field2: `field 2 ${index}`,
  };
}
