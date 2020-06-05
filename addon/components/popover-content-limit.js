/**
 * Modifies child element of popover to be auto resized to fit screen with a scrollbar.
 * 
 * @module components/popover-content-limit
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/popover-content-limit';
import { computed, observer } from '@ember/object';
import PerfectScrollbar from 'npm:perfect-scrollbar';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  classNames: ['popover-content-limit'],
  layout,

  /**
   * @type {PerfectScrollbar}
   */
  perfectScrollbar: undefined,

  /**
   * Is set to true, when size restore was scheduled and not cancelled
   * @type {Boolean}
   */
  scheduledRestore: false,

  /**
   * A main element in popover - eg. an ul when using with dropdown menu
   * @type {HTMLElement}
   */
  targetElement: null,

  openedObserver: observer('opened', function openedObserver() {
    const popover = this.getPopover();
    if (popover) {
      const opened = this.get('opened');
      const restoreSizeAfterCloseFun = this.get('restoreSizeAfterCloseFun');
      if (opened) {
        this.set('scheduledRestore', false);
        if (this.get('targetElement').style.height !== 'auto') {
          this.restoreSize();
        }
        scheduleOnce('afterRender', this, 'updateSize');
      } else {
        popover.addEventListener(
          'transitionend',
          restoreSizeAfterCloseFun, {
            once: true,
          }
        );
        this.set('scheduledRestore', true);
      }
    }
  }),

  restoreSizeAfterCloseFun: computed(function restoreSizeAfterCloseFun() {
    const self = this;
    return function restoreSizeAfterClose(event) {
      // NOTE: will not work if the popover is without opacity transition
      if (self.get('scheduledRestore') && event && event.propertyName === 'opacity') {
        return self.restoreSize();
      }
      this.set('scheduledRestore', false);
    };
  }),

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    const targetElement =
      Array.from(this.get('element').childNodes).find(e => e instanceof HTMLElement);
    this.set('targetElement', targetElement);
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);
    this.updateSize();
  },

  getPopover() {
    const targetElement = this.get('targetElement');
    if (targetElement) {
      return targetElement.closest('.webui-popover');
    }
  },

  restoreSize() {
    this.get('targetElement').style.height = 'auto';
  },

  updateSize() {
    const targetElement = this.get('targetElement');
    const popover = this.getPopover();

    if (!targetElement.classList.contains('ps')) {
      this.set('perfectScrollbar', new PerfectScrollbar(targetElement));
    }

    if (!popover) {
      return;
    }

    const windowMargin =
      Array.from(popover.classList)
      .some(cls => cls.startsWith('bottom') || cls.startsWith('top')) ?
      20 : 10;
    let popoverTop = parseInt(popover.style.top);
    const windowHeight = window.innerHeight;
    if (popoverTop < 0) {
      const offset = popoverTop - windowMargin;
      targetElement.style.height =
        `${targetElement.offsetHeight + offset}px`;
      popover.style.top = `${windowMargin}px`;
      const webuiArrow = popover.querySelector('.webui-arrow');
      if (webuiArrow.style.top) {
        webuiArrow.style.top = `${parseInt(webuiArrow.style.top) + offset}px`;
      }
      popoverTop = parseInt(popover.style.top);
    }
    if (popoverTop + targetElement.offsetHeight > windowHeight) {
      targetElement.style.height = `${windowHeight - popoverTop - windowMargin}px`;
    }

    scheduleOnce('afterRender', () => {
      this.get('perfectScrollbar').update();
    });
  },
});
