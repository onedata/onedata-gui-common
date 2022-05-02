/**
 * A loading form field.
 *
 * @module components/form-component/loading-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/loading-field';
import { reads } from '@ember/object/computed';
import { conditional, raw, equal } from 'ember-awesome-macros';

export default FieldComponentBase.extend({
  layout,
  classNames: ['loading-field'],

  /**
   * @type {ComputedProperty<String>}
   */
  spinnerSize: conditional(equal('field.size', raw('sm')), raw('xxs'), raw('xs')),

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
