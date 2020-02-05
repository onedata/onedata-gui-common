import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/loading-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['loading-field'],

  /**
   * @type {ComputedProperty<boolean>}
   */
  isPending: reads('field.isPending'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isRejected: reads('field.isRejected'),

  /**
   * @type {ComputedProperty<String>}
   */
  loadingText: reads('field.loadingText'),

  /**
   * @type {ComputedProperty<any>}
   */
  loadingError: reads('field.loadingProxy.reason'),
});
