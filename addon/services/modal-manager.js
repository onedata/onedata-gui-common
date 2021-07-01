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
import { resolve } from 'rsvp';
import { get, getProperties, set } from '@ember/object';
import { A } from '@ember/array';
import ModalInstance from 'onedata-gui-common/utils/modal-manager/modal-instance';

export default Service.extend({
  /**
   * Array of stacked modal instances. The last one is at the top of modals rendering stack.
   * @type {Array<Object>}
   */
  modalInstances: undefined,

  init() {
    this._super(...arguments);
    this.set('modalInstances', A());
  },

  /**
   * Shows specified modal. If another modal is already opened, it will be
   * rendered under the new one.
   * @param {string} modalComponentName Name of a modal component (which contains global-modal).
   * Component should be placed inside `components/modals`.
   * @param {Object} modalOptions Modal options. Possible options:
   *   - [hideAfterSubmit=true]: boolean - if true, modal will hide after submit
   *   - [onSubmit]: function - called on modal submit. Can receive submit action data via first
   *     argument. If returns promise, then it will be used to render spinner.
   *   - [onHide]: function - called on modal 'hide' event. If returns false, then
   *     modal close is aborted.
   *   - [*]: any - all other options, that can be accessed by modal component via
   *     `modalManager.modalOptions`.
   * @returns {Object} Object with fields:
   *   - id: String - modal instance id
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
  },

  /**
   * Hides currently opened modal.
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
  },

  onModalHidden(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (!modalInstance) {
      return;
    }
    get(modalInstance, 'resolveHiddenPromise')();
    this.get('modalInstances').removeObject(modalInstance);
  },

  hideAfterSubmit(modalId) {
    const modalInstance = this.getModalInstanceById(modalId);
    if (modalInstance && get(modalInstance, 'options.hideAfterSubmit') !== false) {
      this.hide(modalId);
    }
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
