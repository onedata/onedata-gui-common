/**
 * An Ember component wrapper for webui-popover: https://github.com/sandywalker/webui-popover
 *
 * There is an alternative implementation in: https://github.com/parablesoft/ember-webui-popover
 * but it renders ``<a>`` element with each component instance and assumes
 * that the pover conent will be bound to this anchor, so binding a custom
 * trigger element will be somewhat hacky.
 *
 * In contrast, this wrapper allows to bind popover open to any element with
 * ``triggerSelector`` property.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { assert } from '@ember/debug';
import { get, computed, observer } from '@ember/object';
import { run, scheduleOnce, next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-webui-popover';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { resolve } from 'rsvp';
import dom from 'onedata-gui-common/utils/dom';

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
   * @type {Function}
   * @param {Object} publicApi Object with callbacks, which interacts with popover:
   *   ```
   *   {
   *     reposition(): undefined // recalculates popover position
   *     hide(): undefined // hides popover
   *   }
   *   ```
   */
  registerApi: notImplementedIgnore,

  /**
   * @type {WebuiPopover}
   */
  popoverInstance: undefined,

  /**
   * @type {functions}
   * @param {boolean} opened is popover opened
   * @returns {undefined}
   */
  onToggle: () => {},

  _resizeHandler: computed(function () {
    return () => this.send('refresh');
  }),

  _scrollObserver: observer(
    'scrollState.lastScrollEvent',
    function _scrollObserver() {
      this.send('refresh');
    }
  ),

  /**
   * Workaround for bug in webui popover that causes to the popover to disappear when
   * opening it in 300 ms after hiding. The original jQuery plugin has hardcoded 300 ms
   * async function to $.prototype.hide the element. When user opens the popover in this
   * time, the timeout is not cleared and it hides the element but stays in _opened state.
   * @type {ComputedProperty<Function>}
   */
  customTargetHide: computed('popoverInstance', function customTargetHide() {
    const oneWebuiPopover = this;
    return function customTargetHideFun() {
      if (!get(oneWebuiPopover, 'popoverInstance._opened')) {
        $.prototype.hide.bind(this)();
      }
    };
  }),

  init() {
    this._super(...arguments);
    const open = this.get('open');
    if (open != null) {
      this.set('popoverTrigger', 'manual');
      scheduleOnce('afterRender', () => this.triggerOpen());
    }
    // update scroll observer
    this.get('scrollState.lastScrollEvent');

    this.get('registerApi')({
      reposition: () => this.reposition(),
      hide: () => this.send('hide'),
    });
  },

  triggerOpen: observer('open', function () {
    const open = this.get('open');
    if (open === true) {
      this._popover('show');
    } else if (open === false) {
      const {
        popoverInstance,
        customTargetHide,
      } = this.getProperties('popoverInstance', 'customTargetHide');
      const $target = popoverInstance.$target;
      if ($target && $target.hide !== customTargetHide) {
        $target.hide = customTargetHide;
      }
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
    const {
      triggerSelector,
      animation,
      popoverTrigger,
      popoverStyle,
      element,
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
      'element',
      'elementId',
      'multi',
      'arrow',
      '_resizeHandler',
      'windowEvent'
    );
    const $triggerElement = $(triggerSelector);

    assert(
      'triggerElement should match at least one element',
      $triggerElement.length >= 1
    );

    this.set('$triggerElement', $triggerElement);

    const isInModal = Boolean(element.closest('.modal'));
    $triggerElement.webuiPopover({
      url: `#${elementId}`,
      animation,
      trigger: popoverTrigger,
      placement: this.getPlacement(),
      style: (popoverStyle || '') + (isInModal ? ' over-modals' : ''),
      padding,
      container: document.querySelector('.ember-application'),
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
      const container = popoverInstance.options.container[0];
      const popover = popoverInstance.$target[0];
      if (popover.matches('.left-top, .right-top')) {
        const containerHeight = container ?
          dom.height(container, dom.LayoutBox.PaddingBox) : 0;
        const popoverHeight = dom.height(popover);
        const popoverTop = parseFloat(dom.getStyle(popover, 'top'));
        const popoverBottom = containerHeight - popoverTop - popoverHeight;
        dom.setStyles(popover, {
          top: 'initial',
          bottom: `${popoverBottom}px`,
        });
        const arrow = popover.querySelector('.webui-arrow');
        let arrowTop = dom.getStyle(arrow, 'top');
        if (arrowTop !== 'initial') {
          arrowTop = parseFloat(arrowTop);
          const arrowBottom = dom.height(popover, dom.LayoutBox.PaddingBox) -
            arrowTop - dom.height(arrow) / 2;
          dom.setStyles(arrow, {
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
      const popover = popoverInstance.$target[0];
      const container = popoverInstance.options.container[0];
      if (popover.matches('.left-top, .right-top')) {
        const containerHeight = container ?
          dom.height(container, dom.LayoutBox.PaddingBox) : 0;
        const popoverHeight = dom.height(popover);
        const popoverBottom = parseFloat(dom.getStyle(popover, 'bottom'));
        const popoverTop = containerHeight - popoverBottom - popoverHeight;
        dom.setStyles(popover, {
          top: `${popoverTop}px`,
          bottom: 'initial',
        });
      }
    }
  },

  _debounceResizeRefresh() {
    const {
      $triggerElement,
      open,
    } = this.getProperties('$triggerElement', 'open');
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    if (dom.isVisible($triggerElement[0]) && open !== false) {
      this._popover('show');
    }
    this.set('_debounceTimerEnabled', false);
  },

  reposition() {
    const popoverInstance = this.get('popoverInstance');
    const oldAnimation = popoverInstance.options.animation;
    // suppress animation for the time of reposition
    popoverInstance.options.animation = null;
    this._popover('displayContent');
    popoverInstance.options.animation = oldAnimation;
  },

  actions: {
    hide() {
      this._popover('hide');
    },
    submit() {
      this._popover({ dismissible: false });
      const submit = this.get('submit');
      return (submit ? submit() : resolve()).finally(() => {
        this.send('hide');
      });
    },
    refresh() {
      const {
        _isPopoverVisible,
        _debounceTimerEnabled,
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
      this.reposition();
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
  const container = this.options.container[0];
  const clientWidth = container ?
    dom.width(container, dom.LayoutBox.PaddingBox) : 0;
  const clientHeight = container ?
    dom.height(container, dom.LayoutBox.PaddingBox) : 0;
  const scrollTop = container?.scrollTop ?? 0;
  const scrollLeft = container?.scrollLeft ?? 0;
  const pageX = Math.max(0, pos.left - scrollLeft);
  const pageY = Math.max(0, pos.top - scrollTop);
  const placement = pageX < clientWidth / 2 ? 'right-' : 'left-';
  return placement + (pageY < clientHeight / 2 ? 'bottom' : 'top');
}
