/**
 * Contains API for showing and hiding modals. Allows to show only one modal at
 * a time. Uses modal components defined inside components/modals. Each modal
 * component should contain a global-modal component (not one/bs-modal directly!).
 * Modal component can pass custom onHide, onSubmit and other properties to the
 * global-modal component (these are different than specified by modalManager.show()!).
 *
 * onHide and onSubmit callbacks are chained. If onHide is set both via global-modal
 * component parameter and show(..., { onHide }), then:
 *   - if global-modal component `onHide()` returns false then abort hiding,
 *   - else if `modalOptions.onHide()` returns false then abort hiding,
 *   - else hide modal.
 * So if global-modal onHide returns false, then modalOptions.onHide will not be called.
 * For onSubmit we have:
 *  `global-modal.onSubmit().then(result => modalOptions.onSubmit(result))`
 * So if global-modal onSubmit rejects, then modalOptions.onSubmit will not be called.
 *
 * All global-modal components are showing/hiding according to the state of
 * the modal-manager service. So it is important to render only one instance of
 * the global-modal for the whole application.
 *
 * @module services/modal-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { Promise, resolve } from 'rsvp';
import { writable, raw, conditional, tag } from 'ember-awesome-macros';
import EmberObject, { get, getProperties, set } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { A } from '@ember/array';

export default Service.extend({
  /**
   * If true, then modal `open` property is true.
   * Should not be changed directly!
   * @type {boolean}
   */
  isModalOpened: false,

  /**
   * Resolve callback called to notify about modal `shown` event
   * @type {Function}
   */
  resolveModalShownPromise: resolve,

  /**
   * Promise, which resolves when active modal gets hidden
   * @type {Promise}
   */
  modalHiddenPromise: writable(raw(resolve())),

  /**
   * Resolve callback for `modalHiddenPromise`. Called to notify about modal
   * `hidden` event
   * @type {Function}
   */
  resolveModalHiddenPromise: resolve,

  /**
   * Name of a modal component, which should be rendered after current modal close.
   * @type {string|null}
   */
  queuedShowModalComponentName: null,

  /**
   * Name of a current visible modal component.
   * @type {string}
   */
  modalComponentName: null,

  /**
   * Options passed via `show()` to customize modal.
   * @type {Object}
   */
  modalOptions: Object.freeze({}),

  /**
   * @type {Array<Object>}
   */
  modalInstances: undefined,

  init() {
    this._super(...arguments);
    this.set('modalInstances', A());
  },

  /**
   * Shows specified modal. If another modal is already opened, it will be replaced.
   * @param {string} modalComponentName Name of a modal component (which contains global-modal).
   * Component should be placed inside `components/modals`.
   * @param {Object} modalOptions Modal options. Possible options:
   *   - [hideAfterSubmit=true]: boolean - if true, modal will hide after submit
   *   - [onSubmit]: function - called on modal submit. Can receive submit acton data via first
   *     argument. If returns promise, then it will be used to render spinner.
   *   - [onHide]: function - called on modal 'hide' event. If returns false, then
   *     modal close is aborted.
   *   - [*]: any - all other options, that can be accessed by modal component via
   *     `modalManager.modalOptions`.
   * @returns {Object} Object with fields:
   *   - shownPromise: Promise - resolves when modal is fully visible (after all transitions),
   *   - hiddenPromise: Promise - resolves when modal is fully closed (after all transitions).
   */
  show(modalComponentName, modalOptions = {}) {
    const modalInstance = this.createModalInstance({
      componentName: modalComponentName,
      options: modalOptions,
    });
    this.get('modalInstances').pushObject(modalInstance);

    set(modalInstance, 'isOpened', true);

    return getProperties(modalInstance, 'id', 'shownPromise', 'hiddenPromise');

    // const {
    //   queuedShowModalComponentName,
    //   isModalOpened,
    // } = this.getProperties(
    //   'isModalOpened',
    //   'queuedShowModalComponentName'
    // );

    // if (queuedShowModalComponentName) {
    //   const componentsInfo =
    //     `First modal component: ${queuedShowModalComponentName}, second modal component: ${modalComponentName}.`;
    //   throw new Error(
    //     `modal-manager: You tried to render modal twice in the same runloop frame. ${componentsInfo}`,
    //   );
    // }

    // this.set('queuedShowModalComponentName', modalComponentName);

    // // Hide previous modal if it is still opened
    // let shownPromise = isModalOpened ? this.hide() : resolve();
    // let hideResolve;
    // const hidePromise = new Promise(resolve => {
    //   hideResolve = resolve;
    // }).then(() => {
    //   this.setProperties({
    //     resolveModalHiddenPromise: resolve,
    //     modalHiddenPromise: resolve(),
    //     modalComponentName: null,
    //     modalOptions: {},
    //   });
    // });

    // shownPromise = shownPromise.then(() => {
    //   return new Promise(showResolve => {
    //     this.setProperties({
    //       isModalOpened: true,
    //       modalComponentName: modalComponentName,
    //       modalOptions: modalOptions,
    //       modalHiddenPromise: hidePromise,
    //       resolveModalHiddenPromise: hideResolve,
    //       resolveModalShownPromise: showResolve,
    //       queuedShowModalComponentName: null,
    //     });
    //   }).then(() => {
    //     this.set('resolveModalShownPromise', resolve);
    //   });
    // });

    // return {
    //   shownPromise,
    //   hiddenPromise: hidePromise,
    // };
  },

  /**
   * Hides currently opened modal. If there is no active modal, returns promise,
   * that resolves immediately.
   * @param {String} modalId
   * @returns {Promise} resolves when modal is fully hidden (after transitions).
   *   It is the same promise as `show().hiddenPromise`.
   */
  hide(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (!modalInstance) {
      return resolve();
    }

    set(modalInstance, 'isOpened', false);
    return get(modalInstance, 'hiddenPromise');

    // const {
    //   isModalOpened,
    //   modalHiddenPromise,
    // } = this.getProperties(
    //   'isModalOpened',
    //   'modalHiddenPromise'
    // );

    // if (isModalOpened) {
    //   this.set('isModalOpened', false);
    // }

    // return modalHiddenPromise;
  },

  onModalSubmit(modalId, data) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (!modalInstance) {
      return resolve();
    }

    const onSubmit = get(modalInstance, 'options.onSubmit');
    const submitPromise = resolve(onSubmit && onSubmit(data));
    return submitPromise.finally(() => {
      this.hideAfterSubmit(modalId);
    });

    // const onSubmit = this.get('modalOptions.onSubmit');

    // const submitPromise = resolve(onSubmit && onSubmit(data));
    // return submitPromise.finally(() => {
    //   this.hideAfterSubmit();
    // });
  },

  /**
   * Called when onSubmit callback passed to global-modal rejected. In this case
   * modalOptions.onSubmit should not be called.
   * @returns {Promise} immediately resolving promise.
   */
  onModalFailedSubmit(modalId) {
    this.hideAfterSubmit(modalId);
    return resolve();
  },

  onModalShown(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (modalInstance) {
      get(modalInstance, 'resolveShownPromise')();
    }
    // this.get('resolveModalShownPromise')();
  },

  onModalHide(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    const onHide = modalInstance && get(modalInstance, 'options.onHide');

    if (onHide && onHide() === false) {
      // Cancel modal hide
      return false;
    } else {
      return this.hide(modalId);
    }

    // const onHide = this.get('modalOptions.onHide');

    // if (onHide && onHide() === false) {
    //   // Cancel modal hide
    //   return false;
    // } else {
    //   return this.hide();
    // }
  },

  onModalHidden(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (modalInstance) {
      get(modalInstance, 'resolveHiddenPromise')();
    }
    // this.get('resolveModalHiddenPromise')();
  },

  hideAfterSubmit(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (modalInstance && get(modalInstance, 'options.hideAfterSubmit') !== false) {
      this.hide(modalId);
    }
    // if (this.get('modalOptions.hideAfterSubmit') !== false) {
    //   this.hide();
    // }
  },

  createModalInstance({ componentName, options }) {
    return ModalInstance.create({
      componentName,
      options,
    });
  },

  getModalInstanceById(id) {
    return this.get('modalInstances').findBy('id', id);
  },
});

export const ModalInstance = EmberObject.extend({
  /**
   * @virtual
   * @type {String}
   */
  componentName: undefined,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  isOpened: false,

  /**
   * @virtual optional
   * @type {Object}
   */
  options: undefined,

  /**
   * Resolves `shownPromise`
   * @virtual optional
   * @type {Function}
   */
  resolveShownPromise: undefined,

  /**
   * Resolves when modal is fully visible
   * @virtual optional
   * @type {Promise}
   */
  shownPromise: undefined,

  /**
   * Resolves `hiddenPromise`
   * @virtual optional
   * @type {Function}
   */
  resolveHiddenPromise: undefined,

  /**
   * Resolves when modal is completly hidden
   * @virtual optional
   * @type {Promise}
   */
  hiddenPromise: undefined,

  /**
   * @type {ComputedProperty<String|null>}
   */
  fullComponentName: conditional(
    'componentName',
    tag `modals/${'componentName'}`,
    raw(null)
  ),

  init() {
    const {
      id,
      resolveShownPromise,
      shownPromise,
      resolveHiddenPromise,
      hiddenPromise,
    } = this.getProperties(
      'id',
      'resolveShownPromise',
      'shownPromise',
      'resolveHiddenPromise',
      'hiddenPromise'
    );

    if (!id) {
      this.set('id', guidFor(this));
    }
    if (!resolveShownPromise || !shownPromise) {
      this.set('shownPromise', new Promise(shownResolve =>
        this.set('resolveShownPromise', shownResolve)
      ));
    }
    if (!resolveHiddenPromise || !hiddenPromise) {
      this.set('hiddenPromise', new Promise(hiddenResolve =>
        this.set('resolveHiddenPromise', hiddenResolve)
      ));
    }
  },
});
