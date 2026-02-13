/**
 * A component that shows support size information using a table.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SupportSizeEntry An entry with support size info
 * @property {string} supporterName A supporter name.
 * @property {number} supportSize A support size (in bytes).
 * @property {string} supporterId A supporter id.
 */

import Component from '@ember/component';

import EmberObject, { computed, setProperties } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import layout from 'onedata-gui-common/templates/components/support-size-info/table';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import Bootstrap3Theme from 'ember-models-table/themes/bootstrap3';
import { conditional, raw, eq } from 'ember-awesome-macros';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';
import { reads } from '@ember/object/computed';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';

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
      return this.customSupporterNameHeader ?? this.get('i18n')
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
        this.get('i18n').t('components.supportSizeInfo.table.supportSizeHeader');
    },
    set(key, value) {
      return this.customSupporterSizeHeader = value;
    },
  }),

  perPageLabel: computed(function () {
    return this.get('i18n').t('components.supportSizeInfo.table.perPage');
  }),

  /**
   * @type {Utils.ArrayPaginator}
   */
  paginator: undefined,

  /**
   * @type {string | null}
   */
  customSupporterNameHeader: null,

  /**
   * @type {string | null}
   */
  customSupporterSizeHeader: null,

  isSortedByNameAsc: false,
  isSortedByNameDesc: false,
  isSortedBySizeAsc: false,
  isSortedBySizeDesc: false,

  /**
   * @type {computed.string}
   */
  supporterInfoColumnComponent: conditional(
    eq('type', raw('space')),
    raw('support-size-info/table/supported-space-info'),
    raw('support-size-info/table/truncated-cell')
  ),

  /**
   * Support data prepared to display.
   * @type {computed.Ember.Array.SupportSizeEntry}
   */
  _processedData: computed('data.[]', function () {
    const data = this.get('data');
    addConflictLabels(data, 'supporterName', 'supporterId');
    const processedData = A();
    data.forEach((entry) => {
      processedData.pushObject(EmberObject.create({
        supporterName: entry.get('supporterName'),
        supportSize: entry.get('supportSize'),
        supporterId: entry.get('supporterId'),
        supportSizeStr: bytesToString(entry.get('supportSize'), { iecFormat: true }),
        supporter: {
          name: entry.get('supporterName'),
          entityId: entry.get('supporterId'),
          owner: null,
          conflictLabel: entry.get('conflictLabel'),
        },
      }));
    });
    return processedData;
  }),

  sortedData: computed(
    'data.[]',
    'isSortedByNameAsc',
    'isSortedByNameDesc',
    'isSortedBySizeAsc',
    'isSortedBySizeDesc',
    function sortedData() {
      const processedData = this._processedData.slice();

      if (this.isSortedByNameAsc) {
        return processedData.sortBy('supporterName');
      } else if (this.isSortedByNameDesc) {
        return processedData.sortBy('supporterName').reverse();
      } else if (this.isSortedBySizeDesc) {
        return processedData.sortBy('supportSize').reverse();
      } else {
        return processedData.sortBy('supportSize');
      }
    }),

  /**
   * Columns definition for table.
   * @type {computed.Array.Object}
   */
  _columns: computed('supporterNameHeader', 'supporterSizeHeader', function () {
    const {
      supporterNameHeader,
      supporterSizeHeader,
      supporterInfoColumnComponent,
    } = this.getProperties(
      'supporterNameHeader',
      'supporterSizeHeader',
      'supporterInfoColumnComponent'
    );
    return [{
      propertyName: 'supporterName',
      title: supporterNameHeader,
      className: 'supporter-name-column',
      component: supporterInfoColumnComponent,
    }, {
      propertyName: 'supportSizeStr',
      title: supporterSizeHeader,
      className: 'support-size-column',
      sortedBy: 'supportSize',
      sortDirection: 'desc',
      sortPrecedence: 0,
    }];
  }),

  themeInstance: computed('noDataToShowMessage', function themeInstance() {
    const theme = Bootstrap3Theme.create({
      table: 'table table-striped table-condensed',
      sortAscIcon: 'oneicon oneicon-arrow-up',
      sortDescIcon: 'oneicon oneicon-arrow-down',
      noDataToShowMsg: this.get('noDataToShowMessage'),
    });
    setProperties(theme, getOwner(this).ownerInjection());
    return theme;
  }),

  init() {
    this._super(...arguments);
    this.set('paginator', ArrayPaginator.extend({
      array: reads('parent.sortedData'),
      pageSize: 10,
    }).create({
      parent: this,
    }));
  },
  actions: {
    changePerPage(number) {
      this.set('pageSize', number);
    },
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
