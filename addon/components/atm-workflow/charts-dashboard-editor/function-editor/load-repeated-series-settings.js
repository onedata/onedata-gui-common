/**
 * "loadRepeatedSeries" function settings component. It has the same set of
 * settings as "replaceEmpty" function. Only mapping from model to form
 * differs.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, observer } from '@ember/object';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import ReplaceEmptySettings from './replace-empty-settings';

export default ReplaceEmptySettings.extend({
  formValuesUpdater: observer(
    'chartFunction.replaceEmptyParameters.{strategy,fallbackValue}',
    function formValuesUpdater() {
      const newFallbackValue = this.chartFunction?.replaceEmptyParameters?.fallbackValue ?? '';
      if (newFallbackValue !== this.form.valuesSource.fallbackValue) {
        set(this.form.valuesSource, 'fallbackValue', newFallbackValue);
      }

      const newUsePreviousStrategy =
        this.chartFunction?.replaceEmptyParameters?.strategy ===
        ReplaceEmptyStrategy.UsePrevious;
      if (newUsePreviousStrategy !== this.form.valuesSource.usePreviousStrategy) {
        set(this.form.valuesSource, 'usePreviousStrategy', newUsePreviousStrategy);
      }

      this.form.invalidFields.forEach((field) => field.markAsModified());
    }
  ),

  /**
   * @override
   */
  onValueChange(fieldName, value) {
    let normalizedValue = value;
    if (fieldName === 'fallbackValue') {
      if (this.form.getFieldByPath('fallbackValue').isValid) {
        normalizedValue = value === '' ? null : Number.parseFloat(value);
      }
    } else {
      normalizedValue =
        value ? ReplaceEmptyStrategy.UsePrevious : ReplaceEmptyStrategy.UseFallback;
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.chartFunction,
      propertyName: `replaceEmptyParameters.${fieldName === 'fallbackValue' ? 'fallbackValue' : 'strategy'}`,
      newValue: normalizedValue,
      changeType: fieldName === 'fallbackValue' ? 'continuous' : 'discrete',
    });
    action.execute();
  },
});
