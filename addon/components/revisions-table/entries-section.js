/**
 * Renders a single, expandable section of revisions table. Contains one (optional)
 * always-visible entry and a collection of expandable revisions, which are collapsed
 * by default.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/revisions-table/entries-section';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @virtual
   * @type {Object}
   */
  revisionRegistry: undefined,

  /**
   * @virtual
   * @type {RevisionNumber}
   */
  mainRevisionNumber: undefined,

  /**
   * @virtual
   * @type {RevisionNumber[]}
   */
  collapsedRevisionNumbers: undefined,

  /**
   * @virtual
   * @type {Utils.Revisions.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @virtual
   * @type {number}
   */
  columnsCount: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  expanderClass: undefined,

  /**
   * @virtual optional
   * @type {(revisionNumber: RevisionNumber) => void}
   */
  onRevisionClick: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {boolean}
   */
  isExpanded: false,

  actions: {
    expand() {
      this.set('isExpanded', true);
    },
  },
});
