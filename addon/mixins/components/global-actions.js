/**
 * A mixin that provides global actions feature
 *
 * @module mixins/components/global-actions
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { observer } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Mixin.create({
  navigationState: inject(),

  /**
   * @type {string}
   */
  globalActionsTitle: '',

  /**
   * @type {Array<AspectAction>}
   */
  globalActions: Object.freeze([]),

  globalActionsObserver: observer(
    'globalActions',
    'globalActionsTitle',
    function () {
      const {
        globalActionsTitle,
        globalActions,
      } = this.getProperties('globalActions', 'globalActionsTitle');
      const navigationState = this.get('navigationState');
      if (!navigationState.isDestroyed) {
        navigationState.setProperties({
          aspectActions: globalActions,
          aspectActionsTitle: globalActionsTitle,
        });
      }
    }
  ),

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, 'globalActionsObserver');
  },

  willDestroyElement() {
    scheduleOnce('afterRender', this, () => {
      safeExec(this.get('navigationState'), 'setProperties', {
        aspectActions: [],
        aspectActionsTitle: undefined,
      });
    });
    this._super(...arguments);
  },
});
