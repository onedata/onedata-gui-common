/**
 * A "single line" dataset value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';
import { DatasetDetails } from './visual-presenter';

export default SingleLinePresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'dataset',

  /**
   * @override
   */
  stringifiedValue: computed('datasetDetails.name', function stringifiedValue() {
    const datasetName = this.datasetDetails.name;
    const formattedDatasetName = datasetName ? `"${datasetName}"` : '–';

    return `[${this.t('typeLabel')} ${formattedDatasetName}]`;
  }),

  /**
   * @type {ComputedProperty<DatasetDetails>}
   */
  datasetDetails: computed('value', 'context', function datasetDetails() {
    return DatasetDetails.create({
      dataset: this.value,
      context: this.context,
    });
  }),
});
