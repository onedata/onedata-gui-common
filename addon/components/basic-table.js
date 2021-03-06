import Component from '@ember/component';
import { observer } from '@ember/object';
import { run, debounce, scheduleOnce } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/basic-table';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';
import 'npm:basictable';

/**
 * Creates a table element which uses JQuery Basic Table to handle with small devices.
 *
 * @module components/basic-table.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  tagName: 'table',
  classNames: ['basic-table', 'no-resize'],

  breakpoint: 1200,

  _isMobile: undefined,

  /**
   * Trigger property to run basictable setup
   * @type {undefined}
   */
  setupTrigger: undefined,

  setupTriggerObserver: observer(
    'setupTrigger',
    function setupTriggerObserver() {
      scheduleOnce('afterRender', this, '_reinitializeBasictable');
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    this._initBasictable();
    // prevent from collapse animation on first render
    if (this.$().is('.dropdown-table-rows')) {
      const tdList = this.$('td:not(.row-header)');
      tdList.addClass('no-transition');
      run.next(() => tdList.removeClass('no-transition'));
    }

    $(window).on(
      `resize.${this.get('elementId')}`,
      () => debounce(this, '_updateState', 1)
    );
    this._updateState();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.$().basictable('destroy');
    $(window).off(`resize.${this.get('elementId')}`);
  },

  _initBasictable() {
    this.$().basictable({
      breakpoint: this.get('breakpoint'),
    });
  },

  _reinitializeBasictable() {
    if (this.get('element')) {
      this.$().basictable('setup');
    }
  },

  _updateState() {
    safeExec(
      this,
      'set',
      '_isMobile',
      window.innerWidth <= this.get('breakpoint')
    );
  },

  actions: {
    reinitialize() {
      this._reinitialize();
    },
  },
});
