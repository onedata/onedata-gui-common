import Component from '@ember/component';

export default Component.extend({
  onFetchEntries: async (listingParams) => {
    let startIndex = Number(listingParams.index || '0');
    if (typeof listingParams.offset === 'number') {
      startIndex += listingParams.offset;
    }

    startIndex = Math.max(startIndex, 0);
    const entries = [];
    for (let i = 0; i < listingParams.limit; i++) {
      entries.push(generateEntry(startIndex + i));
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
