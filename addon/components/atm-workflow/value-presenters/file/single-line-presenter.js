/**
 * A "single line" file value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { computed } from '@ember/object';
import { FileDetails } from './visual-presenter';

export default SingleLinePresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'file',

  /**
   * @override
   */
  stringifiedValue: computed('fileDetails.name', function stringifiedValue() {
    const fileName = this.fileDetails.name ?? '';
    const formattedFileName = fileName ? `"${fileName}"` : '–';

    return `[${this.t('typeLabel')} ${formattedFileName}]`;
  }),

  /**
   * @type {ComputedProperty<FileDetails>}
   */
  fileDetails: computed('value', 'context', function fileDetails() {
    return FileDetails.create({
      file: this.value,
      context: this.context,
    });
  }),
});
