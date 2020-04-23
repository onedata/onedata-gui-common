/**
 * A modal that allows accept or cancel some operation or just answer a question
 * with yes/no. modalOptions:
 * - headerText - modal header text
 * - headerIcon - (optional) modal header icon
 * - descriptionParagraphs - description specification which is an array of objects
 *   `{ text: String, className: String }`. `className` is optional.
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
import { or, raw } from 'ember-awesome-macros';
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
   * @virtual
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

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
  yesButtonText: reads('modalOptions.yesButtonText'),

  /**
   * @type {ComputedProperty<String>}
   */
  yesButtonClassName: or('modalOptions.yesButtonClassName', raw('btn-primary')),

  /**
   * @type {ComputedProperty<String>}
   */
  noButtonText: or('modalOptions.noButtonText', computedT('cancel')),

  actions: {
    submit(submitCallback) {
      this.set('isSubmitting', true);
      return resolve(submitCallback())
        .finally(() => safeExec(this, () => this.set('isSubmitting', false)));
    },
  },
});
