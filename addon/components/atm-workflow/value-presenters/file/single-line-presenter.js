/**
 * A "single line" file value presenter.
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
  dataSpecType: 'file',

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const fileName = typeof this.value?.name === 'string' ? this.value.name : '';
    const formattedFileName = fileName ? `"${fileName}"` : '–';

    return `[${this.t('typeLabel')} ${formattedFileName}]`;
  }),
});
