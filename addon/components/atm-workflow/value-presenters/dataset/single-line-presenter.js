/**
 * A "single line" dataset value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';
import { getDatasetNameFromRootFilePath } from 'onedata-gui-common/utils/dataset';

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

    const datasetName = getDatasetNameFromRootFilePath(rootFilePath);
    const formattedDatasetName = datasetName ? `"${datasetName}"` : '–';

    return `[${this.t('typeLabel')} ${formattedDatasetName}]`;
  }),
});
