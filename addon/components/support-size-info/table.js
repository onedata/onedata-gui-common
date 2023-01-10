/**
 * A component that shows support size information using a table.
 *
 * @module components/space-support-info/table
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SupportSizeEntry An entry with support size info
 * @property {string} supporterName A supporter name.
 * @property {number} supportSize A support size (in bytes).
 */

import Component from '@ember/component';

import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/support-size-info/table';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import Bootstrap3Theme from 'ember-models-table/themes/bootstrap3';

export default Component.extend({
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
   * Header title for supporters column.
   * @type {computed.string}
   */
  supporterNameHeader: computed(function () {
    return this.get('i18n')
      .t('components.supportSizeInfo.table.supporterNameHeader');
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
    const data = this.get('data');
    const processedData = A();
    data.forEach((entry) => {
      processedData.pushObject(EmberObject.create({
        supporterName: entry.get('supporterName'),
        supportSize: entry.get('supportSize'),
        supporterId: entry.get('supporterId'),
        supportSizeStr: bytesToString(entry.get('supportSize'), { iecFormat: true }),
      }));
    });
    return processedData;
  }),

  /**
   * Columns definition for table.
   * @type {computed.Array.Object}
   */
  _columns: computed('supporterNameHeader', 'supporterSizeHeader', function () {
    const {
      supporterNameHeader,
      supporterSizeHeader,
    } = this.getProperties('supporterNameHeader', 'supporterSizeHeader');
    return [{
      propertyName: 'supporterName',
      title: supporterNameHeader,
      className: 'supporter-name-column',
      component: 'support-size-info/table/supporter-info',
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
    return Bootstrap3Theme.create({
      'table': 'table table-striped table-condensed',
      'sort-asc': 'oneicon oneicon-arrow-up',
      'sort-desc': 'oneicon oneicon-arrow-down',
      'messages': {
        noDataToShow: this.get('noDataToShowMessage'),
      },
    });
  }),
});
