/**
 * Display id icon and popover with clipboard for id.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/id-info';
import { tag } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  layout,
  tagName: 'span',
  classNames: ['id-info'],

  i18n: service(),

  /**
   * @virtual optional
   * @type {string}
   */
  idType: undefined,

  /**
   * @virtual
   * @type {string}
   */
  idValue: undefined,

  /**
   * @override
   */
  i18nPrefix: 'components.idInfo',

  /**
   * @type {ComputedProperty<String>}
   */
  popoverTriggerId: tag `${'elementId'}-popover-trigger`,

  /**
   * @type {ComputedProperty<String>}
   */
  idLabel: computed('idType', function idLabel() {
    const idType = this.get('idType');
    if (idType) {
      const label = this.t(`${idType}Id`, {}, { defaultValue: '' });
      if (label) {
        return label;
      }
    }
    return this.t('id');
  }),
});
