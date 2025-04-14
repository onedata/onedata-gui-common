// FIXME: jsdoc

export default function compareNumberArrays(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    if (a[i] === b[i]) {
      i++;
    }
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  if (a.length === b.length) {
    return 0;
  }
  if (a.length > i) {
    // B is longer
    return 1;
  } else {
    return -1;
  }
}
