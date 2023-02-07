/**
 * A form field model adopting automatino value editor for forms framework.
 *
 * It works in two modes depending on `isOptional` value:
 * - `isOptional` is true - then value of that field is not required and
 * the value editor is not always visible. Instead - when `value.hasValue`
 * is false - "creator button" is rendered which indicates that there is no
 * value assigned and we can create one. In addition the value editor showed by
 * the "creator button" has a "remove" icon, which allows to come back to
 * an empty state with the "creator button" visible.
 * - `isOptional` is false - then value is mandatory regardless of
 * `value.hasValue` value. The editor is always visible.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer } from '@ember/object';
import _ from 'lodash';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';

/**
 * @typedef {Object} ValueEditorFieldValue
 * @property {boolean} hasValue Flag which allows to differentiate beetween
 * a real empty state and a state when editor is present, but it has a value of
 * null.
 * @property {unknown} value
 */

const defaultI18nPrefix = 'utils.atmWorkflow.valueEditors.valueEditorField';

export const ValueEditorField = FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'atm-workflow/value-editors/value-editor-field',

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  atmDataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmValueEditorContext}
   */
  editorContext: undefined,

  /**
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager}
   */
  editorStateManager: undefined,

  /**
   * @type {ValueEditorStateManagerDump}
   */
  lastEditorStateManagerDump: undefined,

  /**
   * @override
   */
  defaultValue: computed(
    'editorStateManager',
    'isOptional',
    function defaultValue() {
      if (this.isOptional) {
        return {
          hasValue: false,
          value: null,
        };
      } else {
        return {
          hasValue: true,
          value: this.editorStateManager.defaultValue,
        };
      }
    }
  ),

  /**
   * @override
   */
  fieldValidationChecker: computed(
    'value.hasValue',
    'isOptional',
    'lastEditorStateManagerDump.isValid',
    function fieldValidationChecker() {
      const isValidWhenOptional = Boolean(
        !this.value?.hasValue || this.lastEditorStateManagerDump?.isValid
      );
      const isValidWhenNotOptional = Boolean(
        this.value?.hasValue && this.lastEditorStateManagerDump?.isValid
      );
      return {
        isValid: this.isOptional ? isValidWhenOptional : isValidWhenNotOptional,
        errors: [],
      };
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  valueCreatorButtonLabel: computed(
    'i18nPrefix',
    'translationPath',
    function valueCreatorButtonLabel() {
      return this.getTranslation('valueCreatorButtonLabel', {}, {
        defaultValue: this.t(
          `${defaultI18nPrefix}.valueCreatorButtonLabel`, {}, {
            defaultValue: '',
            usePrefix: false,
          },
        ),
      });
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  invalidAtmDataSpecMessage: computed(
    'i18nPrefix',
    'translationPath',
    function invalidAtmDataSpecMessage() {
      return this.getTranslation('invalidAtmDataSpecMessage', {}, {
        defaultValue: this.t(
          `${defaultI18nPrefix}.invalidAtmDataSpecMessage`, {}, {
            defaultValue: '',
            usePrefix: false,
          },
        ),
      });
    }
  ),

  /**
   * @type {ComputedProperty<ValueEditorStateManagerChangeListener>}
   */
  editorStateManagerChangeListener: computed(
    function editorStateManagerChangeListener() {
      return this.handleEditorStateManagerChange.bind(this);
    }
  ),

  editorStateManagerSetter: observer(
    'atmDataSpec',
    function editorStateManagerSetter() {
      const previousEditorStateManager = this.editorStateManager;
      this.setupEditorStateManager();

      if (previousEditorStateManager !== this.editorStateManager) {
        this.handleEditorStateManagerChange({
          value: this.editorStateManager ? this.editorStateManager.value : null,
          isValid: this.editorStateManager ? this.editorStateManager.isValid : false,
        });
      }
    }
  ),

  editorStateManagerValueUpdater: observer(
    'value',
    function editorStateManagerValueUpdater() {
      const value = this.getValueForEditorStateManager();
      if (
        this.editorStateManager &&
        !_.isEqual(this.editorStateManager.value, value)
      ) {
        this.editorStateManager.value = value;
      }
    }
  ),

  editorStateManagerDisabler: observer(
    'isEffectivelyEnabled',
    'isInViewMode',
    function editorStateManagerDisabler() {
      if (this.editorStateManager) {
        this.editorStateManager.isDisabled =
          this.shouldEditorStateManagerBeDisabled();
      }
    }
  ),

  /**
   * @override;
   */
  init() {
    this._super(...arguments);
    this.setupEditorStateManager();
  },

  /**
   * @returns {unknown}
   */
  getValueForEditorStateManager() {
    if (this.value?.hasValue) {
      return this.value.value ?? null;
    }
    return null;
  },

  /**
   * @returns {boolean}
   */
  shouldEditorStateManagerBeDisabled() {
    return !this.isEffectivelyEnabled || this.isInViewMode;
  },

  /**
   * @param {ValueEditorStateManagerDump} dump
   * @returns {void}
   */
  handleEditorStateManagerChange(dump) {
    this.set('lastEditorStateManagerDump', dump);
    if (!this.value?.hasValue || _.isEqual(this.value?.value, dump.value)) {
      return;
    }
    this.valueChanged({
      hasValue: Boolean(this.atmDataSpec),
      value: this.atmDataSpec ? dump.value : null,
    });
  },

  /**
   * @returns {void}
   */
  setupEditorStateManager() {
    if (
      this.atmDataSpec ?
      _.isEqual(this.editorStateManager?.atmDataSpec, this.atmDataSpec) :
      !this.editorStateManager
    ) {
      // Nothing do to.
      return;
    }

    if (this.editorStateManager) {
      this.editorStateManager.removeChangeListener(
        this.editorStateManagerChangeListener
      );
      this.editorStateManager.destroy();
    }

    let editorStateManager = null;
    if (this.atmDataSpec) {
      let value = this.getValueForEditorStateManager();
      if (!validate(value, this.atmDataSpec)) {
        value = undefined;
      }
      editorStateManager = new ValueEditorStateManager(
        this.atmDataSpec,
        this.editorContext,
        value
      );
      editorStateManager.isDisabled = this.shouldEditorStateManagerBeDisabled();
      editorStateManager.addChangeListener(
        this.editorStateManagerChangeListener
      );
    }

    this.set('editorStateManager', editorStateManager);
  },
});

/**
 * @param {unknown} rawValue
 * @param {boolean} [allowEmpty]
 * @returns {ValueEditorFieldValue}
 */
export function rawValueToFormValue(rawValue, allowEmpty = false) {
  return {
    hasValue: (rawValue !== null && rawValue !== undefined) || !allowEmpty,
    value: rawValue ?? null,
  };
}

/**
 * @param {ValueEditorFieldValue} formValue
 * @returns {unknown}
 */
export function formValueToRawValue(formValue) {
  if (!formValue?.hasValue) {
    return null;
  }

  return formValue?.value ?? null;
}
