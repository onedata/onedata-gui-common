/**
 * Renders single revision.
 *
 * @module components/revisions-table/revision-entry
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/revisions-table/revision-entry';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

export default Component.extend(I18n, {
  layout,
  tagName: 'tr',
  classNames: ['revisions-table-revision-entry'],
  classNameBindings: [
    'onClick:clickable',
    'isReadOnly:readonly',
  ],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable.revisionEntry',

  /**
   * @virtual
   * @type {Number}
   */
  revisionNumber: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  revision: undefined,

  /**
   * @virtual
   * @type {Utils.Revisions.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @virtual
   * @type {(revisionNumber: Number) => void}
   */
  onClick: undefined,

  /**
   * If true then no actions can be made on revision (dots menu is hidden)
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Number|'?'>}
   */
  normalizedRevisionNumber: computed(
    'revisionNumber',
    function normalizedRevisionNumber() {
      const revisionNumber = this.get('revisionNumber');
      return Number.isSafeInteger(revisionNumber) ? revisionNumber : '?';
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  state: reads('revision.state'),

  /**
   * @type {ComputedProperty<String>}
   */
  actionsTriggerId: tag `actions-trigger-${'elementId'}`,

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  revisionActions: computed(
    'revisionNumber',
    'revisionActionsFactory',
    function revisionActions() {
      const {
        revisionNumber,
        revisionActionsFactory,
      } = this.getProperties('revisionNumber', 'revisionActionsFactory');
      return revisionActionsFactory ?
        revisionActionsFactory.createActionsForRevisionNumber(revisionNumber) : [];
    }
  ),

  click(event) {
    const {
      onClick,
      revisionNumber,
      element,
    } = this.getProperties('onClick', 'revisionNumber', 'element');

    if (!onClick || !isDirectlyClicked(event, element)) {
      return;
    }
    onClick(revisionNumber);
  },

  actions: {
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
  },
});
