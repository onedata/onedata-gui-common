/**
 * Util for generating displayed ID conflicting names.
 *
 * Generate "minimal" resource IDs from full IDs
 * for naming conflicting files/spaces/groups etc.
 *
 * NOTE: ported from ember-cli-onedata-common
 *
 * @author Jakub Liput
 * @copyright (C) 2016-2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @function
 * @param {Array<string>} ids
 * @returns {[string, string]} [minimal id for A, minimal id for B]
 */
export default function conflictIds(ids) {
  const maxLen = Math.max(...ids.map(name => name.length));

  const bufs = ids.map(name => ({ name: name, buf: [], differs: false }));
  for (let i = 0; i < maxLen; i += 1) {
    const currentLetters = bufs.map(({ name }) => name[i]);
    bufs.forEach(b => {
      if (!b.differs && currentLetters.filter(lt => lt === b.name[i]).length <= 1) {
        b.differs = true;
      }
    });

    bufs.forEach(b => b.buf.push(b.name[i]));

    if (bufs.every(b => b.differs) && i > 2) {
      break;
    }
  }

  return bufs.map(b => b.buf.join(''));
}
