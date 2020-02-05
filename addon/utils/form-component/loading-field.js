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
   * @public
   * @type {ComputedProperty<HtmlSafe>}
   * Will be shown to user while loadingProxy is pending.
   */
  loadingText: computed('i18nPrefix', 'path', function text() {
    return this.tWithDefault(`${this.get('path')}.loadingText`, {}, undefined);
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
})
