/**
 * A loading form field for indicating loading state of a sibling field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { computed, defineProperty, observer } from '@ember/object';
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
  isValid: reads('isFulfilled'),

  /**
   * @type {ComputedProperty<number>}
   */
  siblingIndexInParent: computed(
    'parent.fields.@each.name',
    function siblingIndexInParent() {
      return this.parent?.fields.findIndex(field =>
        field.name === this.siblingName
      ) ?? -1;
    }
  ),

  /**
   * Define `reads` for sibling's tip every time the parent fields change.
   * @type {Ember.Observer}
   */
  siblingTipSetter: observer(
    'siblingIndexInParent',
    function siblingTipSetter() {
      const siblingIndex = this.siblingIndexInParent;
      if (siblingIndex === -1) {
        defineProperty(this, 'tip', {
          value: undefined,
          configurable: true,
        });
      } else {
        defineProperty(this, 'tip', reads('parent.fields.${siblingIndex}.tip'));
      }
    }
  ),

  /**
   * Define `reads` for sibling's label every time the parent fields change.
   * @type {Ember.Observer}
   */
  siblingLabelSetter: observer(
    'siblingIndexInParent',
    function siblingLabelSetter() {
      const siblingIndex = this.siblingIndexInParent;
      if (siblingIndex === -1) {
        defineProperty(this, 'label', {
          value: undefined,
          configurable: true,
        });
      } else {
        defineProperty(this, 'label', reads('parent.fields.${siblingIndex}.label'));
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.siblingLabelSetter();
    this.siblingTipSetter();
  },
});
