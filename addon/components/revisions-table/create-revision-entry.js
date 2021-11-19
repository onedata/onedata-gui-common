import Component from '@ember/component';
import layout from '../../templates/components/revisions-table/create-revision-entry';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['revisions-table-create-revision-entry'],
  classNameBindings: [
    'createRevisionAction.className',
    'createRevisionAction.disabled:disabled:enabled',
  ],

  /**
   * @virtual
   * @type {Number}
   */
  columnsCount: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createRevisionAction: computed(
    'revisionActionsFactory',
    function createRevisionAction() {
      return this.get('revisionActionsFactory').createCreateRevisionAction();
    }
  ),

  /**
   * @override
   */
  click() {
    const createRevisionAction = this.get('createRevisionAction');
    if (createRevisionAction && !get(createRevisionAction, 'disabled')) {
      createRevisionAction.execute();
    }
  },
});
