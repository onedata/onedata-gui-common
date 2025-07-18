/**
 * A loading form field.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/loading-field',

  /**
   * @virtual
   * @type {PromiseObject}
   */
  loadingProxy: undefined,

  /**
   * Will be shown to user while loadingProxy is pending.
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  loadingText: computed('i18nPrefix', 'translationPath', {
    get() {
      return this.customLoadingText ??
        this.getTranslation('loadingText', {}, { defaultValue: '' });
    },
    set(key, value) {
      return this.customLoadingText = value;
    },
  }),

  /**
   * Custom loadingText injected during field creation.
   * @type {string | null}
   */
  customLoadingText: null,

  /**
   * @type {ComputedProperty<boolean>}
   */
  isPending: computed('loadingProxy.isPending', function isPending() {
    if (!this.loadingProxy) {
      return false;
    }
    return this.loadingProxy.isPending;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isFulfilled: computed('loadingProxy.isFulfilled', function isFulfilled() {
    if (!this.loadingProxy) {
      return true;
    }
    return this.loadingProxy.isFulfilled;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isRejected: computed('loadingProxy.isRejected', function isRejected() {
    if (!this.loadingProxy) {
      return false;
    }
    return this.loadingProxy.isRejected;
  }),

  /**
   * @override
   */
  isValueless: true,
});
