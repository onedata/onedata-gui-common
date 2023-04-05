import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not } from 'ember-awesome-macros';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/section';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

export default OneDraggableObject.extend(I18n, {
  layout,
  classNames: [
    'section',
    'one-time-series-charts-section',
    'has-floating-toolbar',
  ],
  classNameBindings: [
    'section.isRoot:root-section',
    'isHovered:hovered',
  ],

  i18n: service(),
  dragDrop: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.section',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  section: undefined,

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
  isDraggable: not('section.isRoot'),

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('section'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section | null>}
   */
  draggedSection: computed('dragDrop.draggedElementModel', function draggedSection() {
    if (this.dragDrop.draggedElementModel?.elementType === ElementType.Section) {
      return this.dragDrop.draggedElementModel;
    } else {
      return null;
    }
  }),

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
  isMeOrParentDragged: computed('section', 'draggedSection', function isMeOrParentDragged() {
    if (!this.draggedSection) {
      return false;
    }

    if (this.section === this.draggedSection) {
      return true;
    }

    let section = this.section;
    while (section.parentSection) {
      if (section.parentSection === this.draggedSection) {
        return true;
      }
      section = section.parentSection;
    }
    return false;
  }),

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
  mouseMove(event) {
    this._super(...arguments);
    const containsHoveredElement =
      event.target.closest('.has-floating-toolbar') !== this.element;
    this.changeHoverState(!containsHoveredElement);
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
     * @returns {void}
     */
    addChart() {
      const action = this.actionsFactory.createAddElementAction({
        newElementType: ElementType.Chart,
        targetSection: this.section,
      });
      action.execute();
    },

    /**
     * @returns {void}
     */
    addSubsection() {
      const action = this.actionsFactory.createAddElementAction({
        newElementType: ElementType.Section,
        targetSection: this.section,
      });
      action.execute();
    },

    /**
     * @param {'before' | 'after' | 'inside'} placement
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Section} draggedElement
     * @returns {void}
     */
    async acceptDraggedElement(placement, draggedElement) {
      // Wait for drag promise to resolve. It allows to execute `dragend`
      // handlers before unmounting components (by action below).
      await this.dragDrop.latestDragPromise;
      const action = this.actionsFactory.createMoveElementAction({
        movedElement: draggedElement,
        newParent: placement === 'inside' ?
          this.section : this.section.parentSection,
        newPosition: placement === 'inside' ? null : {
          placement,
          referenceElement: this.section,
        },
      });
      action.execute();
    },
  },
});
