/**
 * A "single line" time series measurement value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

export default SingleLinePresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'timeSeriesMeasurement',

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const tsName = typeof this.value?.tsName === 'string' ?
      this.value.tsName : '';
    const timestamp = typeof this.value?.timestamp === 'number' ?
      this.value.timestamp : null;
    const value = typeof this.value?.value === 'number' ?
      this.value.value : null;

    const formattedTsName = tsName ? `"${tsName}"` : '–';
    const formattedTimestamp = timestamp !== null ?
      dateFormat([timestamp], { format: 'report' }) : '–';
    const formattedValue = value !== null ? String(value) : '–';

    return `[${this.t('typeLabel')} ${formattedTimestamp};${formattedTsName};${formattedValue}]`;
  }),
});
