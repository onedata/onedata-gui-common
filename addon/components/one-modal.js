/**
 * Custom extension of ember-bootstrap `<BsModal>`
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { scheduleOnce, next } from '@ember/runloop';
import _ from 'lodash';
import Component from '@ember/component';
import { guidFor } from '@ember/object/internals';
import globals from 'onedata-gui-common/utils/globals';
import { layout, tagName } from '@ember-decorators/component';
import template from 'onedata-gui-common/templates/components/one-modal';

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

@tagName('')
@layout(template)
export default class OneModal extends Component {
  @service router;
  @service appProxy;

  /**
   * @virtual optional
   * @type {boolean | (transitionInfo: TransitionInfo) => boolean}
   */
  shouldCloseOnTransition = true;

  /**
   * @type {string}
   */
  prevSize = undefined;

  /**
   * @override
   */
  @computed
  get modalId() {
    return this.id ?? `${guidFor(this)}-modal`;
  }

  /**
   * @type {function}
   */
  @computed
  get recomputeScrollShadowFunction() {
    return this.recomputeScrollShadow.bind(this);
  }

  /**
   * @type {(transition: Transition) => void}
   */
  @computed
  get routeChangeHandler() {
    return (transition) => this.handleRouteChange(transition);
  }

  /**
   * @type {(event: AppProxyPropertyChangeEvent) => void}
   */
  @computed
  get appProxyPropertyChangeHandler() {
    return (event) => this.handleAppProxyPropertyChange(event);
  }

  get effTransitionDuration() {
    return config.environment === 'test' ? 1 : this.transitionDuration;
  }

  get effBackdropTransitionDuration() {
    return config.environment === 'test' ? 1 : this.backdropTransitionDuration;
  }

  get modalElement() {
    return globals.document.getElementById(this.modalId);
  }

  init() {
    super.init(...arguments);
    this.prevSize = this.size;
    this.registerRouteChangeHandler();
    this.registerAppProxyPropertyChangeHandler();
  }

  /**
   * @override
   */
  didUpdateAttrs() {
    super.didUpdateAttrs(...arguments);
    if (this.prevSize !== this.size) {
      this.set('prevSize', this.size);
      // Change of modal size corrupts scroll shadow css classes, so we need to
      // recompute them again.
      scheduleOnce('afterRender', this, 'recomputeScrollShadow');
    }
  }

  // FIXME: sprawdzić w starej wersji kiedy faktycznie odpalało się to didRender
  // spróbować wymyślić jak można się podpiąć pod te zdarzenia

  /**
   * @override
   */
  didRender() {
    const element = globals.document.getElementById(this.modalId);
    // Modals make some magic with positioning which does not fire perfect-scrollbars
    // overflow detection on render. We need to notify perfect-scrollbar about change
    if (element) {
      const scrollableArea = element.querySelector('.bs-modal-body-scroll');
      if (scrollableArea) {
        scrollableArea.dispatchEvent(new Event('parentrender'));
      }
    }
  }

  /**
   * @override
   */
  willDestroyElement() {
    this.unregisterRouteChangeHandler();
    this.unregisterAppProxyPropertyChangeHandler();
  }

  recomputeScrollShadow() {
    const { modalElement } = this;
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
  }

  toggleListeners(enabled) {
    const {
      modalElement,
      recomputeScrollShadowFunction,
    } = this;

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
  }

  registerRouteChangeHandler() {
    this.router.on('routeDidChange', this.routeChangeHandler);
  }

  unregisterRouteChangeHandler() {
    this.router.off('routeDidChange', this.routeChangeHandler);
  }

  registerAppProxyPropertyChangeHandler() {
    this.appProxy.registerPropertyChangeListener(this.appProxyPropertyChangeHandler);
  }

  unregisterAppProxyPropertyChangeHandler() {
    this.appProxy.unregisterPropertyChangeListener(this.appProxyPropertyChangeHandler);
  }

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
      this.close();
    }
  }

  close() {
    if (this.onHide?.() !== false) {
      this.set('isOpen', false);
    }
  }

  /**
   * @param {AppProxyPropertyChangeEvent} event
   * @returns {void}
   */
  handleAppProxyPropertyChange(event) {
    const navigationProperties = this.appProxy.getNavigationProperties();
    const cleanedEvent = this.cleanChangedPropertiesEvent(event);

    if (
      !navigationProperties.some((propName) =>
        propName in cleanedEvent.changedProperties
      )
    ) {
      return;
    }

    const transitionInfo = { type: 'appProxy', data: cleanedEvent };
    if (this.calculateShouldCloseOnTransition(transitionInfo)) {
      this.close();
    }
  }

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
  }

  /**
   * @param {TransitionInfo} transitionInfo
   * @returns {boolean}
   */
  calculateShouldCloseOnTransition(transitionInfo) {
    return typeof this.shouldCloseOnTransition === 'function' ?
      this.shouldCloseOnTransition(transitionInfo) : this.shouldCloseOnTransition;
  }

  @action
  show() {
    this.onShow?.();
    scheduleOnce('afterRender', this, 'toggleListeners', true);
  }

  @action
  hide() {
    this.onHide?.();
    this.toggleListeners(false);
  }
}
