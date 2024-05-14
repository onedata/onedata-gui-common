/**
 * Common definitions for data spec params editors.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} DataSpecParamsEditor<T extends AtmDataSpec>
 * @property {(includeExpandParams: boolean) => boolean} [hasForm] Should be
 *   defined if form presence is optional.
 * @property {typeof FormFieldsGroup} FormElement Definition of params form.
 * @property {(values: unknown, includeExpandParams: boolean) => Omit<T, 'type'>} formValuesToAtmDataSpecParams
 *   Converts form values into data spec params.
 * @property {(atmDataSpec: T, includeExpandParams: boolean) => unknown} atmDataSpecParamsToFormValues
 *   Converts data spec params into form values.
 * @property {(i18n: Ember.Service, values: unknown) => SafeString} summarizeFormValues
 *   Calculates a stringified representation of form values, which can be used
 *   as a summary.
 * @property {(values: unknown) => boolean} shouldWarnOnRemove It returns
 *   true if there should be additional confirmation before deleting data spec
 *   with provided form values inside. It helps avoiding deleting complicated
 *   setups by mistake.
 */
