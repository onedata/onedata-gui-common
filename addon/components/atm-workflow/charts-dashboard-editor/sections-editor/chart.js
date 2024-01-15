/**
 * Shows single dashboard chart.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { equal, not, raw } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/chart';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import {
  ElementType,
  translateValidationErrorsBatch,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';
import { ChartNavigation } from 'onedata-gui-common/utils/time-series-dashboard';

export default OneDraggableObject.extend(I18n, {
  layout,
  classNames: [
    'chart',
    'section-chart',
    'one-time-series-chart-plot',
    'has-floating-toolbar',
    'clickable',
  ],
  classNameBindings: [
    'chart.isSelected:selected',
    'isHovered:hovered',
  ],

  i18n: service(),
  dragDrop: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.chart',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {boolean}
   */
  isHovered: false,

  /**
   * For one-draggable-object
   * @override
   */
  isDraggable: not('editorContext.isReadOnly'),

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('chart'),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  validationErrorsMessage: computed(
    'chart.validationErrors',
    function validationErrorsMessage() {
      return translateValidationErrorsBatch(
        this.i18n,
        this.chart.validationErrors,
      );
    }
  ),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null>}
   */
  draggedChart: computed(
    'dragDrop.draggedElementModel',
    'chart.elementOwner',
    function draggedChart() {
      if (
        this.dragDrop.draggedElementModel?.elementType === ElementType.Chart &&
        this.dragDrop.draggedElementModel?.elementOwner === this.chart.elementOwner
      ) {
        return this.dragDrop.draggedElementModel;
      } else {
        return null;
      }
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isMeDragged: equal('chart', 'draggedChart'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isChartNavigationVisible: equal(
    'chart.parent.chartNavigation',
    raw(ChartNavigation.Independent)
  ),

  /**
   * @override
   */
  mouseLeave() {
    this._super(...arguments);
    this.changeHoverState(false);
  },

  /**
   * @override
   */
  mouseMove() {
    this._super(...arguments);
    this.changeHoverState(true);
  },

  /**
   * @override
   */
  click(event) {
    this._super(...arguments);
    if (isDirectlyClicked(event)) {
      const action = this.editorContext.actionsFactory
        .createSelectElementAction({ elementToSelect: this.chart });
      action.execute();
    }
  },

  /**
   * Changes hovered state and adds classes to the element.
   * @param {boolean} newState
   */
  changeHoverState(newState) {
    if (newState !== this.get('isHovered')) {
      this.set('isHovered', newState);
    }
  },

  actions: {
    /**
     * @param {'before' | 'after'} placement
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Chart} draggedElement
     * @returns {void}
     */
    async acceptDraggedElement(placement, draggedElement) {
      const action = this.editorContext.actionsFactory.createMoveElementAction({
        movedElement: draggedElement,
        newParent: this.chart.parent,
        newPosition: {
          placement,
          referenceElement: this.chart,
        },
      });
      action.execute();
    },

    /**
     * @returns {void}
     */
    editContent() {
      const action = this.editorContext.actionsFactory.createEditChartContentAction({
        chart: this.chart,
      });
      action.execute();
    },
  },
});
