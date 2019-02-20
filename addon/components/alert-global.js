/**
 * A singleton component that is used by ``alert`` service.
 *
 * Place it in application template.
 *
 * @module components/alert-global
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/alert-global';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  alert: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.alertGlobal',

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  open: readOnly('alert.opened'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  text: readOnly('alert.text'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  options: readOnly('alert.options'),

  actions: {
    onHide() {
      this.set('alert.opened', false);
    },
  }
});
