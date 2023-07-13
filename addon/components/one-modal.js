/**
 * Custom extension of ember-bootstrap bs-modal
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsModal from 'ember-bootstrap/components/bs-modal';
import config from 'ember-get-config';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { or, tag } from 'ember-awesome-macros';
import { scheduleOnce, next } from '@ember/runloop';
import _ from 'lodash';

/**
 * @typedef {Object} RouterTransitionInfo
 * @property {'transition'} type
 * @property {Transition} data
 */

/**
 * @typedef {Object} AppProxyTransitionInfo
 * @property {'appProxy'} type
 * @property {AppProxyPropertyChangeEvent} data
 */

/**
 * @typedef {RouterTransitionInfo | AppProxyTransitionInfo} TransitionInfo
 */

export default BsModal.extend({
  tagName: '',

  router: service(),
  appProxy: service(),

  /**
   * @virtual optional
   * @type {boolean | (transitionInfo: TransitionInfo) => boolean}
   */
  shouldCloseOnTransition: true,

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
  backdropId: tag`${'componentGuid'}-backdrop`,

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

  /**
   * @type {ComputedProperty<(transition: Transition) => void>}
   */
  routeChangeHandler: computed(function routeChangeHandler() {
    return (transition) => this.handleRouteChange(transition);
  }),

  /**
   * @type {ComputedProperty<(event: AppProxyPropertyChangeEvent) => void>}
   */
  appProxyPropertyChangeHandler: computed(function appProxyPropertyChangeHandler() {
    return (event) => this.handleAppProxyPropertyChange(event);
  }),

  sizeObserver: observer('size', function sizeObserver() {
    // Change of modal size corrupts scroll shadow css classes, so we need to
    // recompute them again.
    scheduleOnce('afterRender', this, 'recomputeScrollShadow');
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
    this.registerRouteChangeHandler();
    this.registerAppProxyPropertyChangeHandler();
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);

    // Modals make some magic with positioning which does not fire perfect-scrollbars
    // overflow detection on render. We need to notify perfect-scrollbar about change
    const modalElement = this.get('modalElement');
    if (modalElement) {
      const scrollableArea = modalElement.querySelector('.bs-modal-body-scroll');
      if (scrollableArea) {
        scrollableArea.dispatchEvent(new Event('parentrender'));
      }
    }
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.unregisterRouteChangeHandler();
      this.unregisterAppProxyPropertyChangeHandler();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  show() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, 'toggleListeners', true);
  },

  /**
   * @override
   */
  hide() {
    this._super(...arguments);
    this.toggleListeners(false);
  },

  recomputeScrollShadow() {
    const modalElement = this.get('modalElement');
    if (modalElement) {
      const area = modalElement.querySelector('.bs-modal-body-scroll');
      const modalDialog = modalElement.querySelector('.modal-dialog');
      if (modalDialog && area) {
        const scrolledTop = area.classList.contains('on-top');
        const scrolledBottom = area.classList.contains('on-bottom');

        // We do not add classes to the modalElement, because its classes are changing too
        // frequently,so it would clear scroll classes added below. On the other hand the
        // class list of modalDialog is pretty constant (except modal size change)
        modalDialog.classList[scrolledTop ? 'add' : 'remove']('scroll-on-top');
        modalDialog.classList[scrolledBottom ? 'add' : 'remove']('scroll-on-bottom');
      }
    }
  },

  toggleListeners(enabled) {
    const {
      modalElement,
      recomputeScrollShadowFunction,
    } = this.getProperties('modalElement', 'recomputeScrollShadowFunction');

    if (modalElement) {
      const area = modalElement.querySelector('.bs-modal-body-scroll');
      if (area) {
        const methodName = `${enabled ? 'add' : 'remove'}EventListener`;
        area[methodName]('edge-scroll-change', recomputeScrollShadowFunction);

        if (enabled) {
          next(() => this.recomputeScrollShadow());
        }
      }
    }
  },

  registerRouteChangeHandler() {
    this.router.on('routeDidChange', this.routeChangeHandler);
  },

  unregisterRouteChangeHandler() {
    this.router.off('routeDidChange', this.routeChangeHandler);
  },

  registerAppProxyPropertyChangeHandler() {
    this.appProxy.registerPropertyChangeListener(this.appProxyPropertyChangeHandler);
  },

  unregisterAppProxyPropertyChangeHandler() {
    this.appProxy.unregisterPropertyChangeListener(this.appProxyPropertyChangeHandler);
  },

  /**
   * @param {Transition} transition
   * @returns {void}
   */
  handleRouteChange(transition) {
    if (transition.isAborted) {
      return;
    }

    const transitionInfo = { type: 'transition', data: transition };
    if (this.calculateShouldCloseOnTransition(transitionInfo)) {
      this.send('close');
    }
  },

  /**
   * @param {AppProxyPropertyChangeEvent} event
   * @returns {void}
   */
  handleAppProxyPropertyChange(event) {
    const navigationProperties = this.appProxy.getNavigationProperties();
    const cleanedEvent = this.cleanChangedPropertiesEvent(event);

    if (
      !event.changedProperties.length ||
      !navigationProperties.some((propName) =>
        propName in cleanedEvent.changedProperties
      )
    ) {
      return;
    }

    const transitionInfo = { type: 'appProxy', data: cleanedEvent };
    if (this.calculateShouldCloseOnTransition(transitionInfo)) {
      this.send('close');
    }
  },

  /**
   * Removes info about properties which values are deep equal from
   * AppProxyPropertyChangeEvent object.
   * @param {AppProxyPropertyChangeEvent} event
   * @returns {AppProxyPropertyChangeEvent}
   */
  cleanChangedPropertiesEvent(event) {
    const realChangedProperties = {};
    for (const propertyName in event.changedProperties) {
      const { prevValue, newValue } = event.changedProperties[propertyName];
      if (!_.isEqual(prevValue, newValue)) {
        realChangedProperties[propertyName] = { prevValue, newValue };
      }
    }
    return { ...event, changedProperties: realChangedProperties };
  },

  /**
   * @param {TransitionInfo} transitionInfo
   * @returns {boolean}
   */
  calculateShouldCloseOnTransition(transitionInfo) {
    return typeof this.shouldCloseOnTransition === 'function' ?
      this.shouldCloseOnTransition(transitionInfo) : this.shouldCloseOnTransition;
  },
});
