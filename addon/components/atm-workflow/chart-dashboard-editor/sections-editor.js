/**
 * An editor component for dashboard sections. Allows to manage sections and
 * charts existence and layout.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/sections-editor';
import {
  ElementType,
  EdgeScroller,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

export default Component.extend({
  layout,
  classNames: ['sections-editor'],

  dragDrop: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Section}
   */
  rootSection: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.SectionElement | null}
   */
  selectedElement: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EdgeScroller}
   */
  edgeScroller: undefined,

  edgeScrollerEnabler: observer(
    'dragDrop.draggedElementModel.elementType',
    function edgeScrollerEnabler() {
      const draggedElementType = this.dragDrop.draggedElementModel?.elementType;
      if (
        draggedElementType === ElementType.Chart ||
        draggedElementType === ElementType.Section
      ) {
        this.edgeScroller?.enable();
      } else {
        this.edgeScroller?.disable();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.edgeScrollerEnabler();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.set('edgeScroller', new EdgeScroller(
      this.element.querySelector('.dashboard-visualiser')
    ));
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.edgeScroller?.destroy();
      this.set('edgeScroller', undefined);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {HTMLDivElement | null}
   */
  getWorkspaceElement() {
    return this.element?.querySelector('.dashboard-visualiser') ?? null;
  },

  actions: {
    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    workspaceClick(event) {
      if (event.target === this.getWorkspaceElement()) {
        const action = this.editorContext.actionsFactory
          .createSelectElementAction({ elementToSelect: null });
        action.execute();
      }
    },
  },
});
