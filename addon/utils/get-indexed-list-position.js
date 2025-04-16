// FIXME: jsdoc

import compareStringBytes from './compare-string-bytes';

export default function getIndexedListPosition(items, recordIndex) {
  if (recordIndex === null) {
    return 0;
  } else {
    let lastPos = 0;
    while (
      lastPos < items.length &&
      compareStringBytes(items[lastPos].index, recordIndex) === -1
    ) {
      lastPos += 1;
    }
    return lastPos;
  }
}
