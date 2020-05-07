/**
 * Custom extension of ember-bootstrap bs-modal
 *
 * @module components/bs-modal
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsModal from 'ember-bootstrap/components/bs-modal';
import config from 'ember-get-config';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { or, tag } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';

export default BsModal.extend({
  tagName: '',

  _window: window,

  /**
   * In original source code modalId depends on elementId which is null here,
   * due to an empty tag.
   * @override
   */
  modalId: or('id', tag `${'componentGuid'}-modal`),

  /**
   * In original source code modalId depends on elementId which is null here,
   * due to an empty tag.
   * @override
   */
  backdropId: tag `${'componentGuid'}-backdrop`,

  /**
   * @type {ComputedProperty<String>}
   */
  componentGuid: computed(function componentGuid() {
    return guidFor(this);
  }),

  /**
   * @type {ComputedProperty<Function>}
   */
  recomputeScrollShadowFunction: computed(function recomputeScrollShadowFunction() {
    return this.recomputeScrollShadow.bind(this);
  }),

  init() {
    this._super(...arguments);

    if (config.environment === 'test') {
      // 1ms (not 0) for animation to prevent from firing shown and hidden events
      // in the same runloop frame as its' trigger events.
      this.setProperties({
        transitionDuration: 1,
        backdropTransitionDuration: 1,
      });
    }
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => {
      this.recomputeScrollShadow();
    });
  },

  /**
   * @override
   */
  show() {
    this._super(...arguments);
    this.toggleScrollListener(true);
  },

  /**
   * @override
   */
  hide() {
    this._super(...arguments);
    this.toggleScrollListener(false);
  },

  recomputeScrollShadow() {
    const modalElement = this.get('modalElement');
    if (modalElement) {
      const area = modalElement.querySelector('.bs-modal-body-scroll');
      const scrolledTop = area.scrollTop <= 0;
      const scrolledBottom = area.scrollTop + area.clientHeight >= area.scrollHeight;

      modalElement.classList[scrolledTop ? 'add' : 'remove']('scroll-on-top');
      modalElement.classList[scrolledBottom ? 'add' : 'remove']('scroll-on-the-bottom');
    }
  },

  toggleScrollListener(enabled) {
    const {
      _window,
      modalElement,
      recomputeScrollShadowFunction,
    } = this.getProperties('_window', 'modalElement', 'recomputeScrollShadowFunction');
    const methodName = `${enabled ? 'add' : 'remove'}EventListener`;
    if (modalElement) {
      modalElement.querySelector('.bs-modal-body-scroll')[methodName](
        'scroll',
        recomputeScrollShadowFunction
      );
    }
    _window[methodName]('resize', recomputeScrollShadowFunction);
  },
});
