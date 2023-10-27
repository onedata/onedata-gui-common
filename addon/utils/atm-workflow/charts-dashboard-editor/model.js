/**
 * Main model for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, set } from '@ember/object';

export default EmberObject.extend({
  /**
   * @public
   * @virtual
   * @type {unknown}
   */
  elementsOwner: undefined,

  /**
   * @public
   * @virtual
   * @type {Array<ChartsDashboardEditorDataSource>}
   */
  dataSources: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  rootSection: null,

  dataSourcesAssigner: observer('dataSources', function dataSourcesAssigner() {
    if (!this.rootSection) {
      return;
    }

    const allElements = [
      this.rootSection,
      ...this.rootSection.nestedElements(),
    ];
    allElements.forEach((element) => set(element, 'dataSources', this.dataSources));
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.rootSection?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {AtmTimeSeriesDashboardSpec}
   */
  toJson() {
    return {
      rootSection: this.rootSection?.toJson() ?? null,
    };
  },
});
