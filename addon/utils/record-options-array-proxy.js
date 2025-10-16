/**
 * A proxy array that transforms source array to an array of options ready to use
 * by dropdown or other enumeration mechanism. Extracts label and correct icon.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArrayProxy from '@ember/array/proxy';
import { computed, get } from '@ember/object';
import { array } from 'ember-awesome-macros';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import { defaultSeparator } from 'onedata-gui-common/components/name-conflict';

export default ArrayProxy.extend({
  /**
   * @virtual
   * @type {Array<DS.Model>}
   */
  records: undefined,

  /**
   * @type {ComputedProperty<Array<DS.Model>>}
   */
  sortedRecords: array.sort('records', ['name']),

  /**
   * @override
   */
  content: computed('sortedRecords.@each.{name,conflictLabel}', function content() {
    return this.sortedRecords.map(record => {
      const searchableName = record.conflictLabel ?
        `${record.name}${defaultSeparator}${record.conflictLabel}` :
        record.name;
      return {
        value: record,
        label: get(record, 'name'),
        searchableName,
        icon: recordIcon(record),
      };
    });
  }),
});
