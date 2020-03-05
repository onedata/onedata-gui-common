/**
 * Shows modal, that represents a consent for doing something (run some
 * process etc.). Contains two buttons: cancel and proceed (spin-button).
 *
 * @module components/proceed-process-modal
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from '../templates/components/proceed-process-modal';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.proceedProcessModal',

  /**
   * If true, modal is opened
   * @type {boolean}
   */
  opened: false,

  /**
   * If true, modal cannot be closed and proceed button has active spinner
   * @type {boolean}
   */
  processing: false,

  /**
   * Action called to close modal
   * @type {function}
   * @returns {*}
   */
  close: notImplementedThrow,

  /**
   * Action called to proceed
   * @type {function}
   * @returns {*}
   */
  proceed: notImplementedThrow,

  /**
   * Classes assigned to the modal element
   * @type {string}
   */
  modalClass: 'proceed-modal',

  /**
   * Optionally set `size` property of bs-modal
   */
  size: undefined,

  /**
   * If true, the `processing` property will be updated when `proceed` promise starts and
   * settles. Set false to get the old behaviour, where `processing` property was injected.
   * @type {boolean}
   */
  autoDetectProcessing: true,

  /**
   * @type {string}
   */
  modalIcon: null,

  /**
   * Classes assigned to the proceed button
   * @type {string}
   */
  proceedButtonClass: 'btn btn-danger proceed',

  /**
   * If true, proceed button is disabled
   * @type {boolean}
   */
  proceedDisabled: false,

  /**
   * Called when modal has been shown
   * @type {Function}
   */
  onShown: notImplementedIgnore,

  /**
   * Called when modal has been hidden
   * @type {Function}
   */
  onHidden: notImplementedIgnore,

  /**
   * If true, content text will be centered.
   * @type {boolean}
   */
  textCenter: false,

  /**
   * Modal header text.
   * @type {Ember.ComputedString<string>}
   */
  headerText: computed(function headerText() {
    return this.t('headerText');
  }),

  /**
   * Modal content text (usually it will be something like "Are you sure...?").
   * @type {Ember.ComputedString<string>}
   */
  messageText: computed(function messageText() {
    return this.t('messageText');
  }),

  /**
   * Cancel button text.
   * @type {Ember.ComputedProperty<string>}
   */
  cancelButtonText: computed(function cancelButtonText() {
    return this.t('cancel');
  }),

  /**
   * Proceed button text.
   * @type {Ember.ComputedProperty<string>}
   */
  proceedButtonText: computed(function proceedButtonText() {
    return this.t('proceed');
  }),

  actions: {
    proceed() {
      const autoDetectProcessing = this.get('autoDetectProcessing');
      if (autoDetectProcessing) {
        this.set('processing', true);
      }
      try {
        const proceedResult = this.get('proceed')();
        if (proceedResult && proceedResult.finally) {
          proceedResult.finally(() => {
            if (autoDetectProcessing) {
              safeExec(this, 'set', 'processing', false);
            }
          });
        } else {
          if (autoDetectProcessing) {
            this.set('processing', false);
          }
        }
        return proceedResult;
      } catch (error) {
        if (autoDetectProcessing) {
          this.set('processing', false);
        }
        throw error;
      }
    },
  },
});
