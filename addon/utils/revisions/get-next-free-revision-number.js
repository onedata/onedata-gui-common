/**
 * Calculates next free revision number.
 *
 * @module utils/revisions/get-next-free-revision-number
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';

export default function getNextFreeRevisionNumber(existingRevisionNumbers) {
  const sortedExistingRevisionNumbers = sortRevisionNumbers(existingRevisionNumbers);
  if (!sortedExistingRevisionNumbers.length) {
    return 1;
  }
  const maxExistingRevisionNumber =
    sortedExistingRevisionNumbers[sortedExistingRevisionNumbers.length - 1];
  return maxExistingRevisionNumber + 1;
}
