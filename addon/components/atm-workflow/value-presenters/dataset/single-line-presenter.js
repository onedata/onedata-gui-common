/**
 * A "single line" dataset value presenter.
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
  dataSpecType: 'dataset',

  /**
   * @override
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    const rootFilePath = typeof this.value?.rootFilePath === 'string' ?
      this.value.rootFilePath : '';

    const pathElements = rootFilePath.split('/');
    const lastPathElement = pathElements[pathElements.length - 1];
    const formattedFileName = lastPathElement ? `"${lastPathElement}"` : '–';

    return `[${this.t('typeLabel')} ${formattedFileName}]`;
  }),
});
