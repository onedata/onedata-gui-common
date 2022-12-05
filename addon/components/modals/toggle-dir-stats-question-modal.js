/**
 * A modal that allows enable/disable or cancel collect directory statistics
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import computedT from 'onedata-gui-common/utils/computed-t';
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
  headerText: computedT('header'),

  /**
   * @override
   */
  descriptionParagraphs: computed(function descriptionParagraphs() {
    return [{
      text: this.t('question'),
    }, {
      text: this.t('description'),
    }];
  }),

  /**
   * @override
   */
  yesButtonText: computedT('buttonConfirm'),

  /**
   * @override
   */
  yesButtonType: conditional(
    eq('nextDirStatsEnabledValue', raw('enabled')),
    raw('warning'),
    raw('danger'),
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  nextDirStatsEnabledValue: reads('modalOptions.nextDirStatsEnabledValue'),
});
