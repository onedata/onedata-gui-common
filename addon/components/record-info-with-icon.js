/**
 * Renders animated icon, which show popover with record info after click,
 * when records type is user show username with fullname, otherwise only name.
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

  icon: computed('recordType', function icon() {
    return recordIcon(this.recordType);
  }),

  /**
   * @virtual optional
   * @type {Object}
   */
  errorReason: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  recordType: reads('record.constructor.modelName'),

  /**
   * @type {Boolean}
   */
  hasRecordInfoHovered: false,

  actions: {
    recordInfoHovered(hasHover) {
      this.set('hasRecordInfoHovered', hasHover);
    },
  },
});
