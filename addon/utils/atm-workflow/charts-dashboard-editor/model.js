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

  dataSourcesAssigner: observer(
    'rootSection',
    'dataSources',
    function dataSourcesAssigner() {
      if (!this.rootSection) {
        return;
      }

      const allElements = [
        this.rootSection,
        ...this.rootSection.nestedElements(),
      ];
      allElements.forEach((element) => {
        if (element.dataSources !== this.dataSources) {
          set(element, 'dataSources', this.dataSources);
        }
      });
    }
  ),

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
   * @returns {AtmTimeSeriesDashboardSpec | null}
   */
  toJson() {
    const rootSectionJson = this.rootSection?.toJson();
    return rootSectionJson ? { rootSection: rootSectionJson } : null;
  },
});
