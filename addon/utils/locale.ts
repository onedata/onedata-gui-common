/**
 * Provides i18n translation method that uses a prefix set in constructor.
 *
 * Enables use of `tt` helper with Octane components. Example component implementation:
 *
 * ```js
 * export default class OctaneExampleComponent extends Component {
 *   @computed()
 *   get locale() {
 *     return new Locale('components.octaneExample');
 *   }
 *
 *   get textBar() {
 *     return this.locale.t('bar');
 *   }
 * }
 * ```
 *
 * Template file:
 *
 * ```hbs
 * <div>
 *   {{tt this "foo"}}
 *   {{this.textBar}}
 * </div>
 * ```
 *
 * The above component will use translations provided in i18n translation files with
 * prefix `components.octaneExample`, so it will render translations for:
 * - `components.octaneExample.foo`
 * - `components.octaneExample.bar`
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { I18nService, SafeString } from 'onedata-gui-common/utils/missing-types';
import { getI18nService } from 'onedata-gui-common/utils/i18n/t';
import { isMissingMessage } from 'onedata-gui-common/utils/i18n/missing-message';

export default class Locale {
  static createPrefix(i18nPrefix: string) {
    if (i18nPrefix) {
      return i18nPrefix.endsWith('.') ? i18nPrefix : i18nPrefix + '.';
    } else {
      return '';
    }
  }

  #i18n: I18nService;

  #i18nPrefix: string;

  #tPrefix: string;

  get i18nPrefix() {
    return this.#i18nPrefix;
  }

  get tPrefix() {
    return this.#tPrefix;
  }

  get i18n() {
    return this.#i18n;
  }

  constructor(i18nPrefix: string) {
    this.#i18n = getI18nService();
    this.#i18nPrefix = i18nPrefix;
    this.#tPrefix = Locale.createPrefix(i18nPrefix);
  }

  /**
   * Translate text using i18n service, using optional i18nPrefix
   * @returns string translated by 18n service
   */
  t(
    translationKey: string,
    placeholders: Record<string, string | SafeString> = {},
    { usePrefix, defaultValue } = { usePrefix: true, defaultValue: undefined }
  ): SafeString {
    const translation = this.i18n.t(
      (usePrefix !== false ? this.tPrefix : '') + translationKey,
      placeholders
    );
    if (defaultValue !== undefined && isMissingMessage(translation)) {
      return defaultValue;
    } else {
      return translation;
    }
  }
}
