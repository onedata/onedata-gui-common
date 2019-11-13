/**
 * Renders modal component (which includes global-modal) specified by modal-manager.
 * There should be only one instance of global-modal-mounter across whole running
 * application.
 * 
 * @module components/global-modal-mounter
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/global-modal-mounter';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: '',

  modalManager: service(),

  /**
   * If true, then it will render the name of component specified by modalManager
   * instead of rendering it. Is usefull when component set in modalManager does
   * not exist as a real implementation.
   * @virtual optional
   * @type {boolean}
   */
  testMode: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  componentName: computed('modalManager.componentName', function componentName() {
    const componentNameFromManager = this.get('modalManager.componentName');
    return componentNameFromManager ? `modals/${componentNameFromManager}` : null;
  }),
});
