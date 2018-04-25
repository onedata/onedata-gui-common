/**
 * Render additional information about app
 *
 * @module components/brand-info.js
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/brand-info';

export default Component.extend({
  layout,
  classNames: ['brand-info'],
  
  guiUtils: inject(),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  guiVersion: reads('guiUtils.guiVersion'),

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
});
