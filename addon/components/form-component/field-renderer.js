/**
 * A component responsible for rendering form elements.
 *
 * @module components/form-component/field-renderer
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/form-component/field-renderer';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  and,
  tag,
  writable,
  equal,
  raw,
  conditional,
} from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['field-renderer', 'form-group'],
  classNameBindings: [
    'validationClass',
    'canShowValidationIcon:has-validation-icon',
    'fieldNameClass',
    'fieldModeClass',
    'isEffectivelyEnabled:field-enabled:field-disabled',
    'fieldRendererClass',
    'fieldSizeClass',
    'field.classes',
    'field.internalClasses',
  ],

  /**
   * @virtual
   * @type {Utils.FormComponent.FormElement}
   */
  field: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  fieldId: writable(tag `${'elementId'}-field`),

  /**
   * @type {ComputedProperty<String>}
   */
  fieldComponentName: reads('field.fieldComponentName'),

  /**
   * @type {ComputedProperty<String>}
   */
  label: reads('field.label'),

  /**
   * @type {ComputedProperty<String>}
   */
  tip: reads('field.tip'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  addColonToLabel: reads('field.addColonToLabel'),

  /**
   * @type {ComputedProperty<String>}
   */
  afterComponentName: reads('field.afterComponentName'),

  /**
   * @type {ComputedProperty<String>}
   */
  tooltipClass: reads('field.tooltipClass'),

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('field.mode'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isValid: reads('field.isValid'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isModified: reads('field.isModified'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEffectivelyEnabled: reads('field.isEffectivelyEnabled'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  withValidationIcon: reads('field.withValidationIcon'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  areValidationClassesEnabled: reads('field.areValidationClassesEnabled'),

  /**
   * @type {ComputedProperty<String>}
   */
  validationClass: computed(
    'isValid',
    'isModified',
    'areValidationClassesEnabled',
    'mode',
    function validationClass() {
      const {
        isValid,
        isModified,
        areValidationClassesEnabled,
        mode,
      } = this.getProperties(
        'isValid',
        'isModified',
        'areValidationClassesEnabled',
        'mode'
      );

      if (isModified && areValidationClassesEnabled && mode === 'edit') {
        return isValid ? 'has-success' : 'has-error';
      }
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canShowValidationIcon: and(
    'isModified',
    'isEffectivelyEnabled',
    'withValidationIcon',
    equal('mode', raw('edit'))
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canShowValidationMessage: and(
    'isModified',
    'isEffectivelyEnabled',
    'error.message',
    equal('mode', raw('edit'))
  ),

  /**
   * @type {ComputedProperty<Object>}
   */
  error: reads('field.errors.firstObject'),

  /**
   * @type {ComputedProperty<String>}
   */
  fieldNameClass: computed('field.name', function fieldNameClass() {
    const name = this.get('field.name');
    return name && `${name}-field`;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  fieldModeClass: tag `field-${'mode'}-mode`,

  /**
   * @type {ComputedProperty<String>}
   */
  fieldRendererClass: computed('field.fieldComponentName', function fieldRendererClass() {
    // It takes only the last part of component name. So it transforms
    // 'form-component/radio-field' to 'radio-field-renderer'.
    const fieldComponentName = this.get('field.fieldComponentName');
    if (fieldComponentName) {
      const componentNameParts = fieldComponentName.split('/');
      return `${componentNameParts[componentNameParts.length - 1]}-renderer`;
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  fieldSizeClass: conditional(
    equal('field.size', raw('sm')),
    raw('form-group-sm'),
    raw('')
  ),
});
