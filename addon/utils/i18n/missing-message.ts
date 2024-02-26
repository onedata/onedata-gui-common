/**
 * Defines what to do, when i18n message is missing. It is used by ember-i18n.
 * @see https://github.com/jamesarosen/ember-i18n/wiki/Doc:-Missing-Translations
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { SafeString } from 'onedata-gui-common/utils/missing-types';

export const missingMessagePrefixes = [
  '<missing-',
  // Default one sometimes used by i18n in test environment
  'Missing translation: ',
] as const;

export function isMissingMessage(message: SafeString | string): boolean {
  if (message) {
    const messageString = String(message);
    return missingMessagePrefixes.some((prefix) => messageString.startsWith(prefix));
  } else {
    return false;
  }
}

export default function (locale: string, key: string /*, context*/ ): string {
  return `<missing-${locale}: ${key}>`;
}
