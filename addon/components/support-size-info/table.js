/**
 * A component that shows support size information using a table.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SupportSizeEntry An entry with support size info
 * @property {string} supporterName A supporter name.
 * @property {number} supportSize A support size (in bytes).
 * @property {string} supporterId A supporter id.
 */

import Component from '@ember/component';

import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/support-size-info/table';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import Bootstrap3Theme from 'ember-models-table/themes/bootstrap3';
import { conditional, raw, eq } from 'ember-awesome-macros';

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
   * Type of record in first column
   * @virtual optional
   * @type {'space'|'provider'}
   */
  type: '',

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
