/**
 * Shows modal, that represents a consent for doing something (run some
 * process etc.). Contains two buttons: cancel and proceed.
 *
 * @author Michał Borzęcki
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
   * @virtual optional
   * @type {boolean}
   */
  shouldCloseOnTransition: true,

  /**
   * If true, modal is opened
   * @virtual
   * @type {boolean}
   */
  opened: false,

  /**
   * Action called to close modal
   * @virtual
   * @type {function}
   * @returns {*}
   */
  close: notImplementedThrow,

  /**
   * Action called to proceed
   * @virtual
   * @type {function}
   * @returns {*}
   */
  proceed: notImplementedThrow,

  /**
   * If true, modal cannot be closed and proceed button has active spinner
   * @virtual optional
   * @type {boolean}
   */
  processing: false,

  /**
   * Classes assigned to the modal element
   * @virtual optional
   * @type {string}
   */
  modalClass: 'proceed-modal',

  /**
   * @virtual optional
   * Optionally set `size` property of bs-modal
   */
  size: undefined,

  /**
   * If true, the `processing` property will be updated when `proceed` promise starts and
   * settles. Set false to get the old behaviour, where `processing` property was injected.
   * @virtual optional
   * @type {boolean}
   */
  autoDetectProcessing: true,

  /**
   * @virtual optional
   * @type {string}
   */
  modalIcon: null,

  /**
   * Classes assigned to the proceed button
   * @virtual optional
   * @type {string}
   */
  proceedButtonClass: 'btn btn-danger proceed',

  /**
   * If true, proceed button is disabled
   * @virtual optional
   * @type {boolean}
   */
  proceedDisabled: false,

  /**
   * Called when modal has been shown
   * @virtual optional
   * @type {Function}
   */
  onShown: notImplementedIgnore,

  /**
   * Called when modal has been hidden
   * @virtual optional
   * @type {Function}
   */
  onHidden: notImplementedIgnore,

  /**
   * If true, content text will be centered.
   * @virtual optional
   * @type {boolean}
   */
  textCenter: false,

  /**
   * Modal header text.
   * @virtual optional
   * @type {Ember.ComputedString<string>}
   */
  headerText: computed({
    get() {
      return this.injectedHeaderText ?? this.t('headerText');
    },
    set(key, value) {
      return this.injectedHeaderText = value;
    },
  }),

  /**
   * Modal content text (usually it will be something like "Are you sure...?").
   * @virtual optional
   * @type {Ember.ComputedString<string>}
   */
  messageText: computed({
    get() {
      return this.injectedMessageText ?? this.t('messageText');
    },
    set(key, value) {
      return this.injectedMessageText = value;
    },
  }),

  /**
   * Cancel button text.
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  cancelButtonText: computed({
    get() {
      return this.injectedCancelButtonText ?? this.t('cancel');
    },
    set(key, value) {
      return this.injectedCancelButtonText = value;
    },
  }),

  /**
   * Proceed button text.
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  proceedButtonText: computed({
    get() {
      return this.injectedProceedButtonText ?? this.t('proceed');
    },
    set(key, value) {
      return this.injectedProceedButtonText = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedHeaderText: null,

  /**
   * @type {string | null}
   */
  injectedMessageText: null,

  /**
   * @type {string | null}
   */
  injectedCancelButtonText: null,

  /**
   * @type {string | null}
   */
  injectedProceedButtonText: null,

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
