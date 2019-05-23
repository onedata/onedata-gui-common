/**
 * Render additional information about app
 *
 * @module components/brand-info
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/brand-info';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['brand-info'],

  i18nPrefix: 'components.brandInfo',

  guiUtils: service(),

  /**
   * @type {ComputedProperty<object>}
   */
  softwareVersionDetails: reads('guiUtils.softwareVersionDetails'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  guiType: reads('guiUtils.guiType'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  guiName: reads('guiUtils.guiName'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  guiIcon: reads('guiUtils.guiIcon'),

  actions: {
    logout() {
      return this.get('guiUtils').logout();
    },
  },
});
