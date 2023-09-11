/**
 * A single item of `elements-list` component. Renders single dashboard element
 * with possible actions (like adding nested element, duplication, removal).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';
import { translateValidationErrorsBatch } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-list-item';

export default OneDraggableObject.extend(I18n, {
  layout,
  tagName: 'li',
  classNames: ['elements-list-item'],
  attributeBindings: ['itemModel.item.id:data-chart-element-id'],

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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowNesting: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  hideActions: false,

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('itemModel.item'),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  validationErrorsMessage: computed(
    'itemModel.item.validationErrors',
    function validationErrorsMessage() {
      return translateValidationErrorsBatch(
        this.i18n,
        this.itemModel.item.validationErrors,
      );
    }
  ),

  actions: {
    select(event) {
      if (!isDirectlyClicked(event)) {
        return;
      }
      const action = this.editorContext.actionsFactory.createSelectElementAction({
        elementToSelect: this.itemModel.item,
      });
      action.execute();
    },
    add() {
      if (!this.allowNesting) {
        return;
      }

      const action = this.editorContext.actionsFactory.createAddElementAction({
        newElementType: this.itemModel.item.elementType,
        targetElement: this.itemModel.item,
      });
      action.execute();
    },
    duplicate() {
      const action = this.editorContext.actionsFactory.createDuplicateElementAction({
        elementToDuplicate: this.itemModel.item,
      });
      action.execute();
    },
    remove() {
      const action = this.editorContext.actionsFactory.createRemoveElementAction({
        elementToRemove: this.itemModel.item,
      });
      action.execute();
    },
  },
});
