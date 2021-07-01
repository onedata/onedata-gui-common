/**
 * Renders special instance of one-modal, which uses state of modalManager service
 * to control itself.
 *
 * @module components/global-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/global-modal';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { resolve } from 'rsvp';
import { isArray } from '@ember/array';
import { array, raw } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  tagName: '',

  modalManager: service(),

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * If true, modal can be close using backdrop click and Escape key
   * @virtual optional
   * @type {boolean}
   */
  allowClose: true,

  /**
   * Callback called on modal hide. If returns false, then modal hide is cancelled.
   * @virtual optional
   * @type {Function}
   */
  onHide: notImplementedIgnore,

  /**
   * Function called after modal submit. If it returns a promise, then a spinner
   * will be rendered inside the "Submit" button until settled. If returned promise
   * rejects, then `onSubmit` callback set via ModalManager will not be called.
   * More info in ModalManager service documentation.
   * @virtual optional
   * @type {Function}
   * @param {any} data data passed via `modal.submit` action parameter
   */
  onSubmit: data => data,

  /**
   * @type {ComputedProperty<ModalInstance>}
   */
  modalInstance: array.findBy(
    'modalManager.modalInstances',
    raw('id'),
    'modalId'
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  open: reads('modalInstance.isOpened'),

  /**
   * @type {ComputedProperty<String>}
   */
  modalClasses: computed('classNames.[]', function () {
    const classNames = this.get('classNames');
    let classNamesString = '';

    if (isArray(classNames)) {
      classNamesString = classNames.join(' ');
    } else if (classNames) {
      classNamesString = String(classNames);
    }

    return classNamesString + ' global-modal';
  }),

  actions: {
    submit(data) {
      const {
        modalId,
        onSubmit,
        modalManager,
      } = this.getProperties('modalId', 'onSubmit', 'modalManager');

      return resolve(onSubmit(data))
        .then(data => modalManager.onModalSubmit(modalId, data))
        .catch(() => modalManager.onModalFailedSubmit(modalId));
    },
    shown() {
      const {
        modalId,
        modalManager,
      } = this.getProperties('modalId', 'modalManager');
      modalManager.onModalShown(modalId);
    },
    hide() {
      const {
        modalId,
        onHide,
        modalManager,
      } = this.getProperties('modalId', 'onHide', 'modalManager');

      if (onHide() === false) {
        return false;
      } else {
        return modalManager.onModalHide(modalId);
      }
    },
    hidden() {
      const {
        modalId,
        modalManager,
      } = this.getProperties('modalId', 'modalManager');
      modalManager.onModalHidden(modalId);
    },
  },
});
