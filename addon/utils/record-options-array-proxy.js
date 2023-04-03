/**
 * A proxy array that transforms source array to an array of options ready to use
 * by dropdown or other enumeration mechanism. Extracts label and correct icon.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 */

import ArrayProxy from '@ember/array/proxy';
import { computed, get } from '@ember/object';
import { array } from 'ember-awesome-macros';
import recordIcon from 'onedata-gui-common/utils/record-icon';

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
  content: computed('sortedRecords.@each.name', function content() {
    return this.get('sortedRecords').map(record => ({
      value: record,
      label: get(record, 'name'),
      icon: recordIcon(record),
    }));
  }),
});
