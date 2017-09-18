/**
 * A component that shows support size information using a table.
 *
 * @module components/space-support-info/table
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SupportSizeEntry An entry with support size info
 * @property {string} supporterName A supporter name.
 * @property {number} supportSize A support size (in bytes).
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/support-size-info/table';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

const {
  computed,
  A,
  inject: {
    service,
  },
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['support-size-table'],

  i18n: service(),

  /**
   * Support data.
   * @type {Ember.Array.SupportSizeEntry}
   */
  data: null,

  /**
   * Message, that is shown when there is no data
   * @type {string}
   */
  noDataToShowMessage: '',

  /**
   * Custom classes for ember-models-table addon.
   * @type {Ember.Object}
   */
  _tableCustomClasses: Ember.Object.create({
    table: 'table table-striped table-condensed',
  }),

  /**
   * Custom icons for ember-models-table addon.
   * @type {Ember.Object}
   */
  _tableCustomIcons: Ember.Object.create({
    'sort-asc': 'oneicon oneicon-arrow-down',
    'sort-desc': 'oneicon oneicon-arrow-up',
  }),

  /**
   * Custom messages for ember-models-table addon.
   * @type {Ember.Object}
   */
  _tableCustomMessages: computed('noDataToShowMessage', function () {
    return Ember.Object.create({
      noDataToShow: this.get('noDataToShowMessage'),
    })
  }),

  /**
   * Header title for supporters column.
   * @type {computed.string}
   */
  supporterNameHeader: computed(function () {
    return this.get('i18n').t(
      'components.supportSizeInfo.table.supporterNameHeader');
  }),

  /**
   * Header title for size column.
   * @type {computed.string}
   */
  supporterSizeHeader: computed(function () {
    return this.get('i18n').t('components.supportSizeInfo.table.supportSizeHeader');
  }),

  /**
   * Support data prepared to display.
   * @type {computed.Ember.Array.SupportSizeEntry}
   */
  _processedData: computed('data.[]', function () {
    let data = this.get('data');
    let processedData = A();
    data.forEach((entry) => {
      processedData.pushObject(Ember.Object.create({
        supporterName: entry.get('supporterName'),
        supportSize: bytesToString(entry.get('supportSize'), { iecFormat: true }),
      }));
    })
    return processedData;
  }),

  /**
   * Columns definition for table.
   * @type {computed.Array.Object}
   */
  _columns: computed('supporterNameHeader', 'supporterSizeHeader', function () {
    let {
      supporterNameHeader,
      supporterSizeHeader,
    } = this.getProperties('supporterNameHeader', 'supporterSizeHeader');
    return [{
      propertyName: 'supporterName',
      title: supporterNameHeader,
      className: 'supporter-name-column',
      component: 'support-size-info/table/truncated-cell',
    }, {
      propertyName: 'supportSize',
      title: supporterSizeHeader,
      className: 'support-size-column',
    }];
  }),
});
