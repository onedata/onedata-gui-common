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

export default Component.extend({
  layout,
  tagName: '',

  modalManager: service(),

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
   * @type {Ember.ComputedProperty<boolean>}
   */
  open: reads('modalManager.isModalOpened'),

  actions: {
    submit(data) {
      const {
        onSubmit,
        modalManager,
      } = this.getProperties('onSubmit', 'modalManager');

      return resolve(onSubmit(data))
        .then(data => modalManager.onModalSubmit(data))
        .catch(() => modalManager.onModalFailedSubmit());
    },
    shown() {
      this.get('modalManager').onModalShown();
    },
    hide() {
      const {
        onHide,
        modalManager,
      } = this.getProperties('onHide', 'modalManager');

      if (onHide() === false) {
        return false;
      } else {
        return modalManager.onModalHide();
      }
    },
    hidden() {
      this.get('modalManager').onModalHidden();
    },
  },
});
