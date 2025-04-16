// FIXME: jsdoc

import compareNumberArrays from './compare-number-arrays';

export default function compareStringBytes(a, b) {
  return compareNumberArrays(stringToBytes(a), stringToBytes(b));
}

function stringToBytes(text) {
  return Array.from(new TextEncoder().encode(text));
}
