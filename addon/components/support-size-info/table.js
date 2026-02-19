/**
 * A component that shows support size information using a table.
 *
 * @author Michał Borzęcki, Agnieszka Raczek
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SupportSizeDisplayEntry An entry with support size info
 * @property {string} name A supporter name.
 * @property {number} size A support size (in bytes).
 * @property {string} entityId A supporter id.
 * @property {string} sizeStr A support size in a human-readable format.
 * @property {string|undefined} conflictLabel A label to distinguish entries with the same name.
 * @property {string|null} owner An owner of the supporter (if applicable).
 */

import Component from '@ember/component';

import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/support-size-info/table';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';
import { reads } from '@ember/object/computed';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import sortByProperties from 'onedata-gui-common/utils/ember/sort-by-properties';

const DEFAULT_PAGE_SIZE = 10;

export default Component.extend({
  layout,
  classNames: ['support-size-table'],

  i18n: service(),

  /**
   * Support data.
   * @virtual
   * @type {Ember.Array.SupportSizeEntry}
   */
  data: null,

  /**
   * Type of record in first column
   * @virtual optional
   * @type {'space'|'provider'}
   */
  type: '',

  /**
   * Message, that is shown when there is no data
   * @virtual optional
   * @type {string}
   */
  noDataToShowMessage: '',

  /**
   * Header title for supporters column.
   * @virtual optional
   * @type {computed.string}
   */
  supporterNameHeader: computed({
    get() {
      return this.customSupporterNameHeader ?? this.i18n
        .t('components.supportSizeInfo.table.supporterNameHeader');
    },
    set(key, value) {
      return this.customSupporterNameHeader = value;
    },
  }),

  /**
   * Header title for size column.
   * @virtual optional
   * @type {computed.string}
   */
  supporterSizeHeader: computed({
    get() {
      return this.customSupporterSizeHeader ??
        this.i18n.t('components.supportSizeInfo.table.supportSizeHeader');
    },
    set(key, value) {
      return this.customSupporterSizeHeader = value;
    },
  }),

  /**
   * @type {Utils.ArrayPaginator}
   */
  paginator: undefined,

  /**
   * @type {string|null}
   */
  customSupporterNameHeader: null,

  /**
   * @type {string|null}
   */
  customSupporterSizeHeader: null,

  /** @type {boolean} */
  isSortedByNameAsc: false,

  /** @type {boolean} */
  isSortedByNameDesc: false,

  /** @type {boolean} */
  isSortedBySizeAsc: false,

  /** @type {boolean} */
  isSortedBySizeDesc: false,

  /**
   * @type {ComputedProperty<string>}
   */
  perPageLabel: computed(function perPageLabel() {
    return this.i18n.t(
      'components.supportSizeInfo.table.perPage', { type: this.type }
    );
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isPageControlsVisible: computed('data.length', function isPageControlsVisible() {
    return this.data.length > DEFAULT_PAGE_SIZE;
  }),

  /**
   * Support data prepared to display.
   * @type {computed.Ember.Array.SupportSizeDisplayEntry}
   */
  _processedData: computed('data.[]', function () {
    const data = this.data;
    const processedData = A();

    addConflictLabels(data, 'supporterName', 'supporterId');

    data.forEach((entry) => {
      processedData.pushObject(EmberObject.create({
        name: entry.supporterName,
        size: entry.supportSize,
        entityId: entry.supporterId,
        sizeStr: bytesToString(entry.supportSize, { iecFormat: true }),
        owner: null,
        conflictLabel: entry.conflictLabel,
      }));
    });

    return processedData;
  }),

  /**
   * Sorted support data.
   * @type {computed.Ember.Array.SupportSizeDisplayEntry}
   */
  sortedData: computed(
    'data.[]',
    'isSortedByNameAsc',
    'isSortedByNameDesc',
    'isSortedBySizeAsc',
    'isSortedBySizeDesc',
    function sortedData() {
      const processedData = this._processedData.slice();

      if (this.isSortedByNameAsc) {
        return sortByProperties(processedData, ['name:asc']);
      } else if (this.isSortedByNameDesc) {
        return sortByProperties(processedData, ['name:desc']);
      } else if (this.isSortedBySizeDesc) {
        return sortByProperties(processedData, ['size:desc']);
      } else {
        return sortByProperties(processedData, ['size:asc']);
      }
    }),

  init() {
    this._super(...arguments);
    this.set('paginator', ArrayPaginator.extend({
      array: reads('parent.sortedData'),
      pageSize: DEFAULT_PAGE_SIZE,
    }).create({
      parent: this,
    }));
  },

  actions: {
    sortByName() {
      this.setProperties({
        isSortedByNameAsc: !this.isSortedByNameAsc,
        isSortedByNameDesc: this.isSortedByNameAsc,
        isSortedBySizeAsc: false,
        isSortedBySizeDesc: false,
      });
    },
    sortBySize() {
      this.setProperties({
        isSortedByNameAsc: false,
        isSortedByNameDesc: false,
        isSortedBySizeAsc: !this.isSortedBySizeAsc,
        isSortedBySizeDesc: this.isSortedBySizeAsc,
      });
    },
  },
});
