/**
 * A modal that allows accept or cancel some operation or just answer a question
 * with yes/no. modalOptions:
 * - headerText - modal header text
 * - headerIcon - (optional) modal header icon
 * - descriptionParagraphs - description specification which is an array of objects
 *   `{ text: String, className: String }`. `className` is optional.
 * - checkboxMessage - (optional) if not empty, then modal will contain a checkbox with specified
 *   message. May be used to implement "Are you sure?" mechanism
 * - isCheckboxBlocking - (optional) if false, then deselected checkbox will not block
 *   accepting button
 * - yesButtonText - accepting button text
 * - yesButtonClassName - (optional) accepting button classes
 * - noButtonText - (optional) declining button text
 * 
 * @module components/modals/question-modal
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import computedT from 'onedata-gui-common/utils/computed-t';
import { inject as service } from '@ember/service';
import { and, or, not, raw, bool, notEqual } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import layout from '../../templates/components/modals/question-modal';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.questionModal',

  /**
   * Is described in the file header
   * @virtual
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {boolean}
   */
  isCheckboxChecked: false,

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: reads('modalOptions.headerText'),

  /**
   * @type {ComputedProperty<String>}
   */
  headerIcon: reads('modalOptions.headerIcon'),

  /**
   * @type {ComputedProperty<Array<{ text: String, className: String }>>}
   */
  descriptionParagraphs: or('modalOptions.descriptionParagraphs', raw([])),

  /**
   * @type {ComputedProperty<String>}
   */
  checkboxMessage: reads('modalOptions.checkboxMessage'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCheckboxBlocking: notEqual(
    'modalOptions.isCheckboxBlocking',
    raw(false)
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  yesButtonText: or('modalOptions.yesButtonText', computedT('ok')),

  /**
   * @type {ComputedProperty<String>}
   */
  yesButtonClassName: or('modalOptions.yesButtonClassName', raw('btn-primary')),

  /**
   * @type {ComputedProperty<String>}
   */
  noButtonText: or('modalOptions.noButtonText', computedT('cancel')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCheckboxVisible: bool('checkboxMessage'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isYesButtonDisabled: and(
    'isCheckboxVisible',
    'isCheckboxBlocking',
    not('isCheckboxChecked')
  ),

  actions: {
    submit(submitCallback) {
      const {
        isCheckboxVisible,
        isCheckboxChecked,
      } = this.getProperties('isCheckboxVisible', 'isCheckboxChecked');

      let dataToPass;
      if (isCheckboxVisible) {
        dataToPass = { isCheckboxChecked };
      }

      this.set('isSubmitting', true);
      return resolve(submitCallback(dataToPass))
        .finally(() => safeExec(this, () => this.set('isSubmitting', false)));
    },
  },
});
