import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-list-item';

export default Component.extend({
  layout,
  tagName: 'li',
  classNames: ['elements-list-item'],

  /**
   * @virtual
   * @type {ElementsListItemModel}
   */
  itemModel: undefined,

  /**
   * @virtual
   * @type {(itemModel: ElementsListItemModel) => void}
   */
  onItemClick: undefined,
});
