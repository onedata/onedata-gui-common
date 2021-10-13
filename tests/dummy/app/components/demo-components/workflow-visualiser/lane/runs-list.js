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
import { inAdvanceRunNo } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';

export default Component.extend({
  selectedRunNo: undefined,

  runsRegistry: computed(function runsRegistry() {
    const runsMap = {
      [inAdvanceRunNo]: {
        runNo: inAdvanceRunNo,
        sourceRunNo: null,
        status: 'preparing',
      },
    };
    for (let i = 1; i <= 16; i++) {
      const run = {
        runNo: i,
        status: _.sample(laneStatuses),
      };
      if (i > 1) {
        run.sourceRunNo = i % 4 === 0 ? i - 2 : i - 1;
      }
      runsMap[i] = run;
    }
    return runsMap;
  }),
});
