/**
 * A component that is used as a cell renderer flippable icon 
 * with additional info popover and supporter name.
 *
 * @author Angieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/support-size-info/table/supporter-info';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {boolean}
   */
  itemInfoOpened: false,

  /**
   * @type {Boolean}
   */
  hasItemInfoHovered: false,

  /**
   * @type {object}
   */
  space: computed('record', function space() {
    return {
      name: this.record.supporterName,
      entityId: this.record.supporterId,
      owner: null,
    };
  }),

  /**
   * @type {string}
   */
  spaceId: reads('record.supporterId'),

  actions: {
    itemInfoHovered(hasHover) {
      this.set('hasItemInfoHovered', hasHover);
    },
  },
});
