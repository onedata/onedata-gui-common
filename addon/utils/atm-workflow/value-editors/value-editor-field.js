/**
 * A form field model adopting automation value editor for forms framework.
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
import { scheduleOnce } from '@ember/runloop';
import _ from 'lodash';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';

/**
 * @typedef {Object} ValueEditorFieldValue
 * @property {boolean} hasValue `true` value means, that editor has a real,
 *   existing value provided by a user or backend and editor should be rendered.
 *   `false` value means, that value was not provided and editor (when value is
 *   allowed to be optional) should not be rendered. `false` value should
 *   never occur when editor field is not optional - in that case `hasValue`
 *   has to be true with value is just `null`.
 * @property {unknown} [value] Present only, when `hasValue` is `true`.
 */

const defaultI18nPrefix = 'utils.atmWorkflow.valueEditors.valueEditorField';

export const ValueEditorField = FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'atm-workflow/value-editors/value-editor-field',

  /**
   * @override
   */
  areValidationClassesEnabled: false,

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
      let isValid;
      if (this.isOptional) {
        isValid = Boolean(
          !this.value?.hasValue || this.lastEditorStateManagerDump?.isValid
        );
      } else {
        isValid = Boolean(
          this.value?.hasValue && this.lastEditorStateManagerDump?.isValid
        );
      }
      return {
        isValid,
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

  /**
   * @returns {ComputedProperty<boolean>}
   */
  shouldEditorStateManagerBeDisabled: computed(
    'isEffectivelyEnabled',
    'isInViewMode',
    function shouldEditorStateManagerBeDisabled() {
      return !this.isEffectivelyEnabled || this.isInViewMode;
    }
  ),

  editorStateManagerUpdater: observer(
    'atmDataSpec',
    'value',
    'isDisabled',
    function editorStateManagerUpdater() {
      scheduleOnce('afterRender', this, 'setupEditorStateManager');
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
   * @param {ValueEditorStateManagerDump} dump
   * @returns {void}
   */
  handleEditorStateManagerChange(dump) {
    this.set('lastEditorStateManagerDump', dump);
    // if `hasValue` is false, then it should not be possible to receive any
    // change notifications from inside the editor. It's because editor should
    // not be rendered at all when `hasValue` is not true. Checking for
    // `!this.value?.hasValue` condition is here only to catch any logical
    // error in editor code (delayed notifications etc.).
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
    const previousEditorStateManager = this.editorStateManager;
    const value = this.getValueForEditorStateManager();
    if (
      this.atmDataSpec ?
      !_.isEqual(this.editorStateManager?.atmDataSpec, this.atmDataSpec) :
      this.editorStateManager
    ) {
      if (this.editorStateManager) {
        this.editorStateManager.removeChangeListener(
          this.editorStateManagerChangeListener
        );
        this.editorStateManager.destroy();
      }

      let editorStateManager = null;
      if (this.atmDataSpec) {
        editorStateManager = new ValueEditorStateManager(
          this.atmDataSpec,
          this.editorContext,
          validate(value, this.atmDataSpec) ? value : undefined
        );
      }
      this.set('editorStateManager', editorStateManager);
    }

    if (this.editorStateManager) {
      if (
        this.editorStateManager.isDisabled !== this.shouldEditorStateManagerBeDisabled
      ) {
        this.editorStateManager.isDisabled = this.shouldEditorStateManagerBeDisabled;
      }

      if (previousEditorStateManager !== this.editorStateManager) {
        this.editorStateManager.addChangeListener(
          this.editorStateManagerChangeListener
        );
        this.handleEditorStateManagerChange({
          value: this.editorStateManager.value,
          isValid: this.editorStateManager.isValid,
        });
      } else if (!_.isEqual(this.editorStateManager.value, value)) {
        this.editorStateManager.value = value;
      }
    }
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
