/**
 * Joins array of strings to create list-sentences, eg. for conjunction 'or' should
 * generate: `["one", "two", "three"]` -> `one, two or three`.
 * Uses translations of conjuctions - if it is not available it uses passed conjunction.
 * 
 * @module utils/i18n/join-string
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const i18nPrefix = 'utils.joinStrings';

const middleConjunction = ', ';

export default function joinStrings(i18n, array, conjunction) {
  let conjunctionTranslation;
  if (conjunction) {
    conjunctionTranslation = i18n.t(
      `${i18nPrefix}.${conjunction}`, {
        default: conjunction,
      }
    );
    conjunctionTranslation = ` ${conjunctionTranslation} `;
  } else {
    conjunctionTranslation = middleConjunction;
  }
  return [
    array.slice(0, array.length - 1).join(middleConjunction),
    array[array.length - 1],
  ].join(conjunctionTranslation);
}
