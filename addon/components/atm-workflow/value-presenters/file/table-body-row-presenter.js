/**
 * A "table body row" file value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TableBodyRowPresenterBase from '../commons/table-body-row-presenter-base';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/file/table-body-row-presenter';
import { FileDetails } from './visual-presenter';

export default TableBodyRowPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'file',

  /**
   * @type {FileDetails|undefined}
   */
  fileDetailsCache: undefined,

  /**
   * @type {ComputedProperty<FileDetails>}
   */
  fileDetails: computed('value', 'context', function fileDetails() {
    if (
      !this.fileDetailsCache ||
      !_.isEqual(this.value, this.fileDetailsCache.file)
    ) {
      this.set('fileDetailsCache', FileDetails.create({
        file: this.value,
        context: this.context,
      }));
    }

    return this.fileDetailsCache;
  }),

  /**
   * @type {ComputedProperty<SymbolicLinkTargetType>}
   */
  symbolicLinkTargetType: reads('fileDetails.symbolicLinkTargetType'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  pathProxy: reads('fileDetails.pathProxy'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  urlProxy: reads('fileDetails.urlProxy'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  sizeProxy: reads('fileDetails.sizeProxy'),
});
