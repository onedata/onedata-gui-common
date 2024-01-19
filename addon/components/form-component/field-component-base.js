/**
 * A base component for all form elements.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { equal, not, raw } from 'ember-awesome-macros';

export default Component.extend({
  classNames: ['field-component'],

  /**
   * @virtual
   * @type {Utils.FormComponent.FormField}
   */
  field: undefined,

  /**
   * @virtual optional
   * @type {ComputedProperty<String>}
   */
  fieldId: computed('elementId', {
    get() {
      return this.injectedFieldId ?? `${this.elementId}-field`;
    },
    set(key, value) {
      return this.injectedFieldId = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedFieldId: null,

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('field.name'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEffectivelyEnabled: reads('field.isEffectivelyEnabled'),

  /**
   * @type {ComputedProperty<any>}
   */
  value: reads('field.value'),

  /**
   * @type {ComputedProperty<any>}
   */
  defaultValue: reads('field.defaultValue'),

  /**
   * @type {ComputedProperty<String>}
   */
  size: reads('field.size'),

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('field.mode'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isInViewMode: equal('mode', raw('view')),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isInEditMode: not('isInViewMode'),

  actions: {
    valueChanged(value) {
      this.get('field').valueChanged(value);
    },
    focusLost() {
      this.get('field').focusLost();
    },
  },
});
