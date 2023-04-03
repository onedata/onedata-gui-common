import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor';
import ActionsFactory from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/sections-editor-actions/actions-factory';
import UndoManager from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/undo-manager';
import EdgeScroller from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/edge-scroller';
import { SectionElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/section';

export default Component.extend({
  layout,
  classNames: ['sections-editor'],

  dragDrop: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  rootSection: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onRemoveDashboard: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EdgeScroller}
   */
  edgeScroller: undefined,

  edgeScrollerEnabler: observer(
    'dragDrop.draggedElementModel.elementType',
    function edgeScrollerEnabler() {
      if (this.dragDrop.draggedElementModel?.elementType === SectionElementType) {
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

    const actionsFactory = new ActionsFactory(this);
    const undoManager = UndoManager.create();
    actionsFactory.addExecuteListener((action) =>
      undoManager.addActionToHistory(action)
    );

    this.setProperties({
      actionsFactory,
      undoManager,
    });

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
      this.actionsFactory.destroy();
      this.undoManager.destroy();
      this.edgeScroller?.destroy();
      this.setProperties({
        actionsFactory: undefined,
        undoManager: undefined,
        edgeScroller: undefined,
      });
    } finally {
      this._super(...arguments);
    }
  },
});
