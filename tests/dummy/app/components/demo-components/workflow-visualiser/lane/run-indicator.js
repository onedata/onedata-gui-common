/**
 * @module components/demo-components/workflow-visualiser/lane/run-indicator
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  laneRunActionsFactory: undefined,

  init() {
    this._super(...arguments);
    this.set('laneRunActionsFactory', {
      createActionsForRunNo(runNo) {
        return [{
          title: 'someAction',
          action: () => console.log('someAction', runNo),
        }];
      },
    });
  },
});
