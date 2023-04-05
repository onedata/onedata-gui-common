import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { equal } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/chart';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

export default OneDraggableObject.extend(I18n, {
  layout,
  classNames: [
    'chart',
    'section-chart',
    'one-time-series-chart-plot',
    'has-floating-toolbar',
  ],
  classNameBindings: ['isHovered:hovered'],

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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {boolean}
   */
  isHovered: false,

  /**
   * For one-draggable-object
   * @override
   */
  isDraggable: true,

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('chart'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null>}
   */
  draggedChart: computed('dragDrop.draggedElementModel', function draggedChart() {
    if (this.dragDrop.draggedElementModel?.elementType === ElementType.Chart) {
      return this.dragDrop.draggedElementModel;
    } else {
      return null;
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isMeDragged: equal('chart', 'draggedChart'),

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
      // Wait for drag promise to resolve. It allows to execute `dragend`
      // handlers before unmounting components (by action below).
      await this.dragDrop.latestDragPromise;
      const action = this.actionsFactory.createMoveElementAction({
        movedElement: draggedElement,
        newParent: this.chart.parentSection,
        newPosition: {
          placement,
          referenceElement: this.chart,
        },
      });
      action.execute();
    },
  },
});
