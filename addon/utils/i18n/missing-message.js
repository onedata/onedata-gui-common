// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Defines what to do, when i18n message is missing. It is used by ember-i18n.
 * @see https://github.com/jamesarosen/ember-i18n/wiki/Doc:-Missing-Translations
 *
 * @module utils/i18n/missing-message
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const missingMessagePrefixes = [
  '<missing-',
  // Default one sometimes used by i18n in test environment
  'Missing translation: ',
];

export function isMissingMessage(message) {
  if (message) {
    message = String(message);
    return missingMessagePrefixes.any(prefix => message.startsWith(prefix));
  } else {
    return false;
  }
}

export default function (locale, key /*, context*/ ) {
  return `<missing-${locale}: ${key}>`;
}
