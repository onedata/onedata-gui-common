/**
 * A "single line" range value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';

export default SingleLinePresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'range',

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const start = typeof this.value?.start === 'number' ? this.value.start : 0;
    const end = typeof this.value?.end === 'number' ? this.value.end : 0;
    const step = typeof this.value?.step === 'number' ? this.value.step : 0;

    return `[${this.t('typeLabel')} ${start}:${end}:${step}]`;
  }),
});
