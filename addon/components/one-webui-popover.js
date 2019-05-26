/**
 * An Ember component wrapper for webui-popover: https://github.com/sandywalker/webui-popover
 *
 * Requires installation and usage of webui-popover Bower package.
 *
 * There is an alternative implementation in: https://github.com/parablesoft/ember-webui-popover
 * but it renders ``<a>`` element with each component instance and assumes
 * that the pover conent will be bound to this anchor, so binding a custom
 * trigger element will be somewhat hacky.
 *
 * In contrast, this wrapper allows to bind popover open to any element with
 * ``triggerSelector`` property.
 *
 * @module components/one-webui-popover
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { assert } from '@ember/debug';
import { computed, observer } from '@ember/object';
import { run, scheduleOnce, next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-webui-popover';
import { invoke, invokeAction } from 'ember-invoke-action';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  layout,
  classNames: ['one-webui-popover', 'webui-popover-content'],

  scrollState: service(),

  triggerSelector: null,

  open: undefined,

  /**
   * Values: auto, top, right, bottom, left, top-right, top-left, bottom-right,
   *  bottom-left, auto-top, auto-right, auto-bottom, auto-left, horizontal,
   *  vertical, context-menu
   * @type {string}
   */
  placement: 'auto',

  selector: false,
  padding: true,

  /**
   * Popover style class name
   * @type {string}
   */
  popoverStyle: null,

  /**
   * Tells if multiple popovers are allowed.
   * @type {boolean}
   */
  multi: false,

  /**
   * One of: pop, fade
   * @type {string|null}
   */
  animation: 'fade',

  /**
   * One of: click, hover, manual (handle events by your self), sticky (always show after popover is created)
   * @type {string}
   */
  popoverTrigger: 'click',

  /**
   * If true, popover will have an arrow
   * @type {boolean}
   */
  arrow: true,

  /**
   * @type {WebuiPopover}
   */
  popoverInstance: undefined,

  /**
   * @type {functions}
   * @param {boolean} opened is popover opened
   * @return {undefined}
   */
  onToggle: () => {},

  _resizeHandler: computed(function () {
    return () => this.send('refresh');
  }),

  _scrollObserver: observer(
    'scrollState.lastScrollEvent',
    function _scrollObserver() {
      invoke(this, 'refresh');
    }
  ),

  init() {
    this._super(...arguments);
    let open = this.get('open');
    if (open != null) {
      this.set('popoverTrigger', 'manual');
      scheduleOnce('afterRender', () => this.triggerOpen());
    }
    // update scroll observer
    this.get('scrollState.lastScrollEvent');
  },

  triggerOpen: observer('open', function () {
    let open = this.get('open');
    if (open === true) {
      this._popover('show');
    } else if (open === false) {
      this._popover('hide');
    }
  }),

  _isPopoverVisibleObserver: observer('_isPopoverVisible', function () {
    this.get('onToggle')(this.get('_isPopoverVisible'));
  }),

  _isPopoverVisible: false,
  _debounceTimerEnabled: false,

  /**
   * Window event, which occurrence will trigger temporary closing the popover
   * and then rerender. Can be used to temporary close the popover when elements
   * around it changes dynamically and the placement of the popover trigger is
   * not constant.
   * @type {string}
   */
  windowEvent: 'resize',

  didInsertElement() {
    let {
      triggerSelector,
      animation,
      popoverTrigger,
      popoverStyle,
      elementId,
      padding,
      multi,
      arrow,
      _resizeHandler,
      windowEvent,
    } = this.getProperties(
      'triggerSelector',
      'animation',
      'popoverTrigger',
      'popoverStyle',
      'padding',
      'elementId',
      'multi',
      'arrow',
      '_resizeHandler',
      'windowEvent'
    );
    let $triggerElement = $(triggerSelector);

    assert(
      'triggerElement should match at least one element',
      $triggerElement.length >= 1
    );

    this.set('$triggerElement', $triggerElement);

    $triggerElement.webuiPopover({
      url: `#${elementId}`,
      animation,
      trigger: popoverTrigger,
      placement: this.getPlacement(),
      style: popoverStyle,
      padding,
      container: document.body,
      multi,
      arrow,
      onShow: () => this.onShow(),
      onHide: () => this.onHide(),
    });

    this.set('popoverInstance', $triggerElement.data('plugin_webuiPopover'));

    window.addEventListener(windowEvent, _resizeHandler);
  },

  willDestroyElement() {
    this._super(...arguments);

    next(() => this._popover('destroy'));
    const {
      _resizeHandler,
      windowEvent,
    } = this.getProperties('_resizeHandler', 'windowEvent');
    window.removeEventListener(windowEvent, _resizeHandler);
  },

  _popover() {
    this.get('$triggerElement').webuiPopover(...arguments);
  },

  /**
   * @returns {undefined}
   */
  onShow() {
    safeExec(this, 'set', '_isPopoverVisible', true);
    this.fixPosition();
  },

  /**
   * @returns {undefined}
   */
  onHide() {
    safeExec(this, 'set', '_isPopoverVisible', false);
    this.unfixPosition();
  },

  /**
   * Returns popover placement
   * @returns {string|Function}
   */
  getPlacement() {
    const placement = this.get('placement');
    return placement === 'context-menu' ? contextMenuPlacement : placement;
  },

  /**
   * Fixes popover position in special cases
   * @returns {undefined} 
   */
  fixPosition() {
    if (this.get('placement') === 'context-menu') {
      // if context-menu placement is active, popover with ...-top placement
      // needs to be positioned using bottom css property instead of top
      const popoverInstance = this.get('popoverInstance');
      const $popover = popoverInstance.$target;
      if ($popover.is('.left-top, .right-top')) {
        const containerHeight = popoverInstance.options.container.innerHeight();
        const popoverHeight = $popover.outerHeight();
        const popoverTop = parseFloat($popover.css('top'));
        const popoverBottom = containerHeight - popoverTop - popoverHeight;
        $popover.css({
          top: 'initial',
          bottom: `${popoverBottom}px`,
        });
        const $arrow = $popover.find('.webui-arrow');
        let arrowTop = $arrow.css('top');
        if (arrowTop !== 'initial') {
          arrowTop = parseFloat(arrowTop);
          const arrowBottom =
            $popover.innerHeight() - arrowTop - $arrow.outerHeight() / 2;
          $arrow.css({
            top: 'initial',
            bottom: `${arrowBottom}px`,
          });
        }
      }
    }
  },

  /**
   * Rolls back fixes introduced by `fixPosition` method
   * @returns {undefined} 
   */
  unfixPosition() {
    if (this.get('placement') === 'context-menu') {
      const popoverInstance = this.get('popoverInstance');
      const $popover = popoverInstance.$target;
      if ($popover.is('.left-top, .right-top')) {
        const containerHeight = popoverInstance.options.container.innerHeight();
        const popoverHeight = $popover.outerHeight();
        const popoverBottom = parseFloat($popover.css('bottom'));
        const popoverTop = containerHeight - popoverBottom - popoverHeight;
        $popover.css({
          top: `${popoverTop}px`,
          bottom: `initial`,
        });
      }
    }
  },

  _debounceResizeRefresh() {
    let {
      $triggerElement,
      open
    } = this.getProperties('$triggerElement', 'open');
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    if ($triggerElement.is(':visible') && open !== false) {
      this._popover('show');
    }
    this.set('_debounceTimerEnabled', false);
  },

  actions: {
    hide() {
      this._popover('hide');
    },
    submit() {
      this._popover({ dismissible: false });
      let submitPromise = invokeAction(this, 'submit');
      submitPromise.finally(() => {
        invoke(this, 'hide');
      });
      return submitPromise;
    },
    refresh() {
      let {
        _isPopoverVisible,
        _debounceTimerEnabled
      } = this.getProperties('_isPopoverVisible', '_debounceTimerEnabled');
      if (_isPopoverVisible) {
        this._popover('hide');
        this.set('_debounceTimerEnabled', true);
      }
      if (_isPopoverVisible || _debounceTimerEnabled) {
        run.debounce(this, this._debounceResizeRefresh, 500);
      }
    },
    reposition() {
      const popoverInstance = this.get('popoverInstance');
      const oldAnimation = popoverInstance.options.animation;
      // suppress animation for the time of reposition
      popoverInstance.options.animation = null;
      this._popover('displayContent');
      popoverInstance.options.animation = oldAnimation;
    },
  },
});

/**
 * Calculated placement dedicated for context menu popovers. It must be prepared
 * manually, because there is no suitable standard placement. Placement calculated
 * below is equivalent to: right-top|right-bottom|left-top|left-bottom
 * (or horizontal placement without Y-central position).
 * 
 * Code inspired by `getPlacement` method from:
 * https://github.com/sandywalker/webui-popover/blob/master/src/jquery.webui-popover.js
 * 
 * `this` context is a WebuiPopover object
 * 
 * @type {function}
 * @returns {string}
 */
export function contextMenuPlacement() {
  const pos = this.getElementPosition();
  const container = this.options.container;
  const clientWidth = container.innerWidth();
  const clientHeight = container.innerHeight();
  const scrollTop = container.scrollTop();
  const scrollLeft = container.scrollLeft();
  const pageX = Math.max(0, pos.left - scrollLeft);
  const pageY = Math.max(0, pos.top - scrollTop);
  const placement = pageX < clientWidth / 2 ? 'right-' : 'left-';
  return placement + (pageY < clientHeight / 2 ? 'bottom' : 'top');
}
