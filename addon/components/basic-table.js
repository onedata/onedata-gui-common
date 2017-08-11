import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/basic-table';

const {
  run
} = Ember;

/**
 * Creates a table element which uses JQuery Basic Table to handle with small devices.
 *
 * @module components/basic-table.js
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  layout,
  tagName: 'table',
  classNames: ['basic-table', 'no-resize'],

  didInsertElement() {
    this._super(...arguments);
    this.$().basictable({
      breakpoint: 1200
    });
    // prevent from collapse animation on first render
    if (this.$().is('.dropdown-table-rows')) {
      const tdList = this.$('td:not(.row-header)');
      tdList.addClass('no-transition');
      run.next(() => tdList.removeClass('no-transition'));
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this.$().basictable('destroy');
  }
});
