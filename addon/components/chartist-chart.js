/**
 * An extension of chartist-chart component (from ember-cli-chartist addon)
 * which fixes bugs. Fixed bugs:
 * 1. Bug description: Component does not destroy chartist instance when
 *    component is being destroyed.
 *
 *    Bug solution: Use `detach()` method of chartist instance in
 *    `willDestroyElement`.
 *    TODO: VFS-10796 Remove this fix after upgrade to ember-cli-chartist
 *    version 3.0.0+ - that version fixed this issue.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ChartistChart from 'ember-cli-chartist/components/chartist-chart';

export default ChartistChart.extend({
  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.chart?.detach();
    } finally {
      this._super(...arguments);
    }
  },
});
