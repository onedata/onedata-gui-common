/**
 * A modal that allows enable/disable or cancel collect directory statistics. 
 * Data needed from modalOptions:
 * - nextDirStatsEnabledValue - state of directory statistics after accept this modal. 
 *   One of `enabled`, `disabled`.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import QuestionModal from './question-modal';
import { computed } from '@ember/object';
import { conditional, raw, eq } from 'ember-awesome-macros';

export default QuestionModal.extend({
  /**
   * @override
   */
  i18nPrefix: computed('nextDirStatsEnabledValue', function i18nPrefix() {
    return 'components.modals.toggleDirStatsQuestionModal.' +
      this.nextDirStatsEnabledValue;
  }),

  /**
   * @override
   */
  headerIcon: 'sign-warning-rounded',

  /**
   * @override
   */
  headerText: computed('i18nPrefix', function headerText() {
    return this.t('header');
  }),

  /**
   * @override
   */
  descriptionParagraphs: computed('i18nPrefix', function descriptionParagraphs() {
    return [{
      text: this.t('question'),
    }, {
      text: this.t('description'),
    }];
  }),

  /**
   * @override
   */
  yesButtonText: computed('i18nPrefix', function yesButtonText() {
    return this.t('buttonConfirm');
  }),

  /**
   * @override
   */
  yesButtonType: conditional(
    eq('nextDirStatsEnabledValue', raw('enabled')),
    raw('warning'),
    raw('danger'),
  ),

  /**
   * @type {ComputedProperty<'enabled'|'disabled'>}
   */
  nextDirStatsEnabledValue: reads('modalOptions.nextDirStatsEnabledValue'),
});
