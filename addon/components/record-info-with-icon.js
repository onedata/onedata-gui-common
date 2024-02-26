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
   * @virtual optional
   * @type {Ember.ComputerProperty<string>}
   */
  icon: computed('recordType', {
    get() {
      return this.injectedIcon ?? recordIcon(this.recordType);
    },
    set(key, value) {
      return this.injectedIcon = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedIcon: null,

  /**
   * @type {Boolean}
   */
  hasRecordInfoHovered: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  recordType: reads('record.constructor.modelName'),

  actions: {
    recordInfoHovered(hasHover) {
      this.set('hasRecordInfoHovered', hasHover);
    },
  },
});
