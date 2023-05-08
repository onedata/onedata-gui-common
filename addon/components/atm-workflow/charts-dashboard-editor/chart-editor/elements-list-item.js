import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-list-item';

export default OneDraggableObject.extend(I18n, {
  layout,
  tagName: 'li',
  classNames: ['elements-list-item'],
  attributeBindings: ['itemModel.item.id:data-element-id'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.elementsListItem',

  /**
   * @virtual
   * @type {ElementsListItemModel}
   */
  itemModel: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowNesting: false,

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('itemModel.item'),

  actions: {
    select(event) {
      if (!isDirectlyClicked(event)) {
        return;
      }
      const action = this.actionsFactory.createSelectElementAction({
        elementToSelect: this.itemModel.item,
      });
      action.execute();
    },
    add() {
      if (!this.allowNesting) {
        return;
      }

      const action = this.actionsFactory.createAddElementAction({
        newElementType: this.itemModel.item.elementType,
        targetElement: this.itemModel.item,
      });
      action.execute();
    },
    duplicate() {
      const action = this.actionsFactory.createDuplicateElementAction({
        elementToDuplicate: this.itemModel.item,
      });
      action.execute();
    },
    remove() {
      const action = this.actionsFactory.createRemoveElementAction({
        elementToRemove: this.itemModel.item,
      });
      action.execute();
    },
  },
});
