/**
 * The mixin adds a `t` method to facilitate use of translation function
 * using i18n service.
 * You should override `i18nPrefix` property to path of component locale.
 * A prefix can be used with or without trailing dot.
 *
 * @module mixins/components/i18n
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from "@ember/object/mixin";
import { computed } from "@ember/object";

export default Mixin.create({
  /**
   * @virtual
   * @type {string}
   */
  i18nPrefix: undefined,

  /**
   * @virtual
   * A i18n service should be injected into component that uses this mixin
   * @type {Ember.Service}
   */
  i18n: undefined,

  /**
   * Generates ready-to-use translation prefix (adds dot if lacks, etc.)
   * Should not be changed - instead set `i18nPrefix`.
   * @type {Ember.Computed<string>}
   */
  tPrefix: computed('i18nPrefix', function getTPrefix() {
    /** @type {string} */
    const i18nPrefix = this.get('i18nPrefix');
    if (i18nPrefix) {
      return i18nPrefix.endsWith('.') ? i18nPrefix : i18nPrefix + '.';
    } else {
      return '';
    }
  }).readOnly(),

  /**
   * Translate text using i18n service, using optional i18nPrefix
   * @param {string} translationKey
   * @returns {string} string translated by 18n service 
   */
  t(translationKey) {
    const {
      i18n,
      tPrefix,
    } = this.getProperties('i18n', 'tPrefix');
    return i18n.t(tPrefix + translationKey);
  },

  /**
   * Alias to `t` method.
   */
  tt() {
    return this.t(...arguments);
  },
});
