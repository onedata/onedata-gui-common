/**
 * Renders a special revisions table entry, which allows to create new revision.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/revisions-table/create-revision-entry';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['revisions-table-create-revision-entry', 'clickable'],
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
   * @type {Utils.Revisions.RevisionActionsFactory}
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
