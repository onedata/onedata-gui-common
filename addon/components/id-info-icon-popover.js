/**
 * Display id icon and popover with clipboard for id.
 *
 * @module components/id-info-icon-popover
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/id-info-icon-popover';
import { tag } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['id-info-icon'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.idInfoIconPopover',

  /**
   * @type {ComputedProperty<String>}
   */
  subjectIdType: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  subjectValue: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  subjectIdInfoTriggerId: tag `${'elementId'}-subject-id-info-trigger`,

});
