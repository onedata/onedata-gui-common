/**
 * Renders animated icon, which shows popover with record info after click.
 * For `user` records it shows username and fullname,
 * for other types of records - just name.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/record-info-with-icon';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['record-info-with-icon'],

  /**
   * @virtual
   * @type {Object}
   */
  record: undefined,

  /**
   * @virtual optional
   * @type {Object}
   */
  errorReason: undefined,

  /**
   * @type {Boolean}
   */
  hasRecordInfoHovered: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  recordType: reads('record.constructor.modelName'),

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  icon: computed('recordType', function icon() {
    return recordIcon(this.recordType);
  }),

  actions: {
    recordInfoHovered(hasHover) {
      this.set('hasRecordInfoHovered', hasHover);
    },
  },
});
