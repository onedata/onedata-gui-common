/**
 * A "single line" group value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';

export default SingleLinePresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'group',

  /**
   * @override
   */
  stringifiedValue: computed('value.name', function stringifiedValue() {
    const groupName = this.value.name;
    const formattedGroupName = groupName ? `"${groupName}"` : '–';

    return `[${this.t('typeLabel')} ${formattedGroupName}]`;
  }),
});
