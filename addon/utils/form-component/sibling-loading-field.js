/**
 * A loading form field for indicating loading state of a sibling field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { computed } from '@ember/object';
import { reads, not } from '@ember/object/computed';

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
  label: computed('parent.fields.@each.{name,label}', 'siblingName', function label() {
    return this.parent?.fields.find(({ name }) => name === this.siblingName)?.label;
  }),

  /**
   * @override
   */
  tip: computed('parent.fields.@each.{name,tip}', 'siblingName', function tip() {
    return this.parent?.fields.find(({ name }) => name === this.siblingName)?.tip;
  }),

  /**
   * @override
   */
  isValid: reads('isFulfilled'),
});
