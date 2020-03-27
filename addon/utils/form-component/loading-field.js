/**
 * A loading form field.
 * 
 * @module utils/form-component/loading-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/loading-field',

  /**
   * @virtual
   * @type {PromiseObject}
   */
  loadingProxy: computed(() => PromiseObject.create({ promise: resolve() })),

  /**
   * Will be shown to user while loadingProxy is pending.
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  loadingText: computed('i18nPrefix', 'path', function loadingText() {
    return this.t(`${this.get('path')}.loadingText`, {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isPending: reads('loadingProxy.isPending'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isFulfilled: reads('loadingProxy.isFulfilled'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isRejected: reads('loadingProxy.isRejected'),

  /**
   * @override
   */
  isValueless: true,
});
