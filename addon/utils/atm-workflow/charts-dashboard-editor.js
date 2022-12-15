/**
 * Simple charts dashboard editor. For now it is only a JSON textarea.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import JsonField from 'onedata-gui-common/utils/form-component/json-field';

/**
 * @type {Utils.FormComponent.JsonField}
 */
export default JsonField.extend({
  defaultValue: 'null',
});

/**
 * @param {string} formValue
 * @returns {AtmTimeSeriesDashboardSpec|null}
 */
export function formValuesToChartsDashboardSpec(formValue) {
  try {
    return (typeof formValue === 'string') && formValue ? JSON.parse(formValue) : null;
  } catch (err) {
    return null;
  }
}

/**
 * @param {AtmTimeSeriesDashboardSpec|null} chartsDashboardSpec
 * @returns {string}
 */
export function chartsDashboardSpecToFormValue(chartsDashboardSpec) {
  return JSON.stringify(chartsDashboardSpec || null, null, 2);
}
