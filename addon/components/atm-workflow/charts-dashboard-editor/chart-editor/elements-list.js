import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-list';

export const ElementsListItemModel = EmberObject.extend({
  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement}
   */
  item: undefined,

  /**
   * @virtual
   * @type {string}
   */
  renderer: undefined,

  /**
   * @type {ComputedProperty<ElementsListItemModel>}
   */
  nestedModels: computed(() => []),
});

export default Component.extend({
  layout,
  classNames: ['elements-list'],

  /**
   * @virtual
   * @type {Array<ElementsListItemModel>}
   */
  itemModels: undefined,

  /**
   * @virtual
   * @type {(itemModel: ElementsListItemModel) => void}
   */
  onItemClick: undefined,
});
