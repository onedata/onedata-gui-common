/**
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { laneStatuses } from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import _ from 'lodash';
import { inAdvanceRunNumber } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';

export default Component.extend({
  selectedRunNumber: undefined,

  runsRegistry: computed(function runsRegistry() {
    const runsMap = {
      [inAdvanceRunNumber]: {
        runNumber: inAdvanceRunNumber,
        originRunNumber: null,
        status: 'preparing',
      },
    };
    for (let i = 1; i <= 16; i++) {
      const run = {
        runNumber: i,
        status: _.sample(laneStatuses),
      };
      if (i > 1) {
        run.originRunNumber = i % 4 === 0 ? i - 2 : i - 1;
      }
      runsMap[i] = run;
    }
    return runsMap;
  }),
});
