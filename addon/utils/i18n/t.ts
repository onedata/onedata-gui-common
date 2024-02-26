/**
 * Returns translation for specific translation path and placeholders.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { lookupInEmberApp } from 'onedata-gui-common/utils/ember-app';
import { isMissingMessage } from './missing-message';
import { I18nService, SafeString } from 'onedata-gui-common/utils/missing-types';

export function t(
  translationPath: string,
  placeholders: Record<string, string | SafeString> = {}
): SafeString | null {
  const i18n = lookupInEmberApp<I18nService>('service:i18n');
  const translation = i18n?.t(translationPath, placeholders);
  return (!translation || isMissingMessage(translation)) ? null : translation;
}
