/**
 * A loading form field for indicating loading state of a sibling field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { reads } from '@ember/object/computed';
import { not, getBy, array, raw } from 'ember-awesome-macros';

export default LoadingField.extend({
  /**
   * @virtual
   * @type {String}
   */
  siblingName: undefined,

  /**
   * @override
   */
  isVisible: not('isFulfilled'),

  /**
   * @override
   */
  label: getBy(
    array.findBy('parent.fields', raw('name'), 'siblingName'),
    raw('label')
  ),

  /**
   * @override
   */
  tip: getBy(
    array.findBy('parent.fields', raw('name'), 'siblingName'),
    raw('tip')
  ),

  /**
   * @override
   */
  isValid: reads('isFulfilled'),
});
