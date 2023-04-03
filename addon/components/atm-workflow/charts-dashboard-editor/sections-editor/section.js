import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not } from 'ember-awesome-macros';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/section';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { SectionElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/section';

export default OneDraggableObject.extend(I18n, {
  layout,
  classNames: ['section', 'one-time-series-charts-section'],
  classNameBindings: ['section.isRoot:root-section'],

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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.ActionsFactory}
   */
  actionsFactory: undefined,

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
    if (this.dragDrop.draggedElementModel?.elementType === SectionElementType) {
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

  actions: {
    /**
     * @returns {void}
     */
    addSubsection() {
      const action = this.actionsFactory.createAddSubsectionAction({
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
