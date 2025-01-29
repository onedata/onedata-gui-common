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

import { getI18nService } from 'onedata-gui-common/utils/i18n/t';
import { isMissingMessage } from 'onedata-gui-common/utils/i18n/missing-message';

export default class Locale {
  static createPrefix(i18nPrefix) {
    if (i18nPrefix) {
      return i18nPrefix.endsWith('.') ? i18nPrefix : i18nPrefix + '.';
    } else {
      return '';
    }
  }

  /** @type {Ember.Service} */
  #i18n;

  /** @type {string} */
  #i18nPrefix;

  /** @type {string} */
  #tPrefix;

  get i18nPrefix() {
    return this.#i18nPrefix;
  }

  get tPrefix() {
    return this.#tPrefix;
  }

  get i18n() {
    return this.#i18n;
  }

  constructor(i18nPrefix) {
    this.#i18n = getI18nService();
    this.#i18nPrefix = i18nPrefix;
    this.#tPrefix = Locale.createPrefix(i18nPrefix);
  }

  /**
   * Translate text using i18n service, using optional i18nPrefix
   * @param {string} translationKey
   * @param {object} placeholders
   * @param {boolean} options.usePrefix
   * @param {any} options.defaultValue
   * @returns {SafeString} string translated by 18n service
   */
  t(
    translationKey,
    placeholders = {}, { usePrefix, defaultValue } = {
      usePrefix: true,
      defaultValue: undefined,
    }
  ) {
    const translation =
      this.i18n.t(
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
