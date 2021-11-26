/**
 * Sorts passed revision numbers (in ascending order).
 *
 * @module utils/revisions/sort-revision-numbers
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function sortRevisionNumbers(revisionNumbers) {
  const normalizedNumbers = (revisionNumbers || [])
    .map((v) => Number(v))
    .filter((n) => Number.isSafeInteger(n) && n > 0);
  return normalizedNumbers.sort((a, b) => a - b);
}
