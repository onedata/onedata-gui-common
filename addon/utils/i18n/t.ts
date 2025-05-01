/**
 * Returns translation for specific translation path and placeholders.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { lookupInEmberApp } from 'onedata-gui-common/utils/ember-app';
import { isMissingMessage } from './missing-message';
import { I18nService, SafeString } from 'onedata-gui-common/utils/missing-types';

export function getI18nService(): I18nService {
  const i18n = lookupInEmberApp<I18nService>('service:i18n');
  if (!i18n) {
    throw new Error('utils.18n.t: cannot resolve global i18n service');
  }
  return i18n;
}

export function t(
  translationPath: string,
  placeholders: Record<string, string | SafeString> = {}
): SafeString | null {
  const i18n = getI18nService();
  const translation = i18n?.t(translationPath, placeholders);
  return !translation || isMissingMessage(translation) ? null : translation;
}

export function isI18nAvailable(): boolean {
  return Boolean(getI18nService());
}
