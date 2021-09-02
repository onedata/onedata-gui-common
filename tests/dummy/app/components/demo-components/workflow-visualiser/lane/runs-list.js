/**
 * @module components/demo-components/workflow-visualiser/lane/runs-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { laneStatuses } from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import _ from 'lodash';

export default Component.extend({
  runs: computed(function runs() {
    const runsMap = {};
    for (let i = 1; i <= 20; i++) {
      const run = {
        runNo: i,
        status: _.sample(laneStatuses),
      };
      if (i > 1) {
        run.sourceRunNo = i - 1;
      }
      runsMap[i] = run;
    }
    return runsMap;
  }),

  selectedRunNo: undefined,
});
