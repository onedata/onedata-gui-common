/**
 * A proxy array that transforms source array to an array of options ready to use
 * by dropdown or other enumeration mechanism. Extracts label and correct icon. Needs
 * owner injected.
 *
 * @module utils/record-options-array-proxy
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 */

import ArrayProxy from '@ember/array/proxy';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { array } from 'ember-awesome-macros';

export default ArrayProxy.extend(OwnerInjector, {
  oneiconAlias: service(),

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
    const {
      sortedRecords,
      oneiconAlias,
    } = this.getProperties('sortedRecords', 'oneiconAlias');
    return sortedRecords.map(record => ({
      value: record,
      label: get(record, 'name'),
      icon: oneiconAlias.getName(record.constructor.modelName),
    }));
  }),
});
