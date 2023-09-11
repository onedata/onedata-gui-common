/**
 * Shows single dashboard section.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not, and, or } from 'ember-awesome-macros';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/section';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

export default OneDraggableObject.extend(I18n, {
  layout,
  classNames: [
    'section',
    'clickable',
    'one-time-series-charts-section',
    'has-floating-toolbar',
  ],
  classNameBindings: [
    'section.isRoot:root-section',
    'section.isSelected:selected',
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
  isDraggable: and(not('section.isRoot'), not('editorContext.isReadOnly')),

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('section'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section | null>}
   */
  draggedSection: computed(
    'dragDrop.draggedElementModel',
    'section.elementOwner',
    function draggedSection() {
      if (
        this.dragDrop.draggedElementModel?.elementType === ElementType.Section &&
        this.dragDrop.draggedElementModel?.elementOwner === this.section.elementOwner
      ) {
        return this.dragDrop.draggedElementModel;
      } else {
        return null;
      }
    }
  ),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null>}
   */
  draggedChart: computed('dragDrop.draggedElementModel', function draggedChart() {
    if (
      this.dragDrop.draggedElementModel?.elementType === ElementType.Chart &&
      this.dragDrop.draggedElementModel?.elementOwner === this.section.elementOwner
    ) {
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
    while (section.parent) {
      if (section.parent === this.draggedSection) {
        return true;
      }
      section = section.parent;
    }
    return false;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isAcceptingInsideDrag: and(
    not('editorContext.isReadOnly'),
    or(
      'draggedChart',
      and('draggedSection', not('isMeOrParentDragged'))
    )
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isAcceptingEdgeDrag: and(
    not('editorContext.isReadOnly'),
    not('section.isRoot'),
    'draggedSection',
    not('isMeOrParentDragged'),
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
  mouseMove(event) {
    this._super(...arguments);
    const containsHoveredElement =
      event.target.closest('.has-floating-toolbar') !== this.element;
    this.changeHoverState(!containsHoveredElement);
  },

  /**
   * @override
   */
  click(event) {
    this._super(...arguments);
    if (isDirectlyClicked(event)) {
      const action = this.editorContext.actionsFactory
        .createSelectElementAction({ elementToSelect: this.section });
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
     * @returns {void}
     */
    addChart() {
      const action = this.editorContext.actionsFactory.createAddElementAction({
        newElementType: ElementType.Chart,
        targetElement: this.section,
      });
      action.execute();
    },

    /**
     * @returns {void}
     */
    addSubsection() {
      const action = this.editorContext.actionsFactory.createAddElementAction({
        newElementType: ElementType.Section,
        targetElement: this.section,
      });
      action.execute();
    },

    /**
     * @param {'before' | 'after' | 'inside'} placement
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Section} draggedElement
     * @returns {void}
     */
    async acceptDraggedElement(placement, draggedElement) {
      const action = this.editorContext.actionsFactory.createMoveElementAction({
        movedElement: draggedElement,
        newParent: placement === 'inside' ?
          this.section : this.section.parent,
        newPosition: placement === 'inside' ? null : {
          placement,
          referenceElement: this.section,
        },
      });
      action.execute();
    },
  },
});
