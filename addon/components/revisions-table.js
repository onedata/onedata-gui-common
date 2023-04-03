/**
 * Shows all revisions passed via `revisionRegistry`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/revisions-table';
import { computed } from '@ember/object';
import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { raw, or, sum, conditional } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,
  tagName: 'table',
  classNames: ['revisions-table', 'table', 'table-condensed'],
  classNameBindings: ['isReadOnly:readonly'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable',

  /**
   * @virtual
   * @type {number}
   */
  customColumnsCount: 0,

  /**
   * @virtual
   * @type {Object}
   */
  revisionRegistry: undefined,

  /**
   * @virtual
   * @type {Utils.Revisions.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @virtual optional
   * @type {(revisionNumber: RevisionNumber) => void}
   */
  onRevisionClick: undefined,

  /**
   * If true then no actions can be made on revision (dots menu is hidden). Also
   * new revision can't be created
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {ComputedProperty<Number>}
   */
  columnsCount: sum(
    raw(2),
    'customColumnsCount',
    conditional('isReadOnly', raw(0), raw(1))
  ),

  /**
   * @type {ComputedProperty<Array<RevisionNumber>>}
   */
  sortedRevNums: computed(
    'revisionRegistry',
    function sortedRevisionNumbers() {
      const revisionRegistry = this.get('revisionRegistry') || {};
      return sortRevisionNumbers(Object.keys(revisionRegistry)).reverse();
    }
  ),

  /**
   * @type {ComputedProperty<RevisionNumber|null>}
   */
  latestRevNum: or('sortedRevNums.firstObject', raw(null)),

  /**
   * @type {ComputedProperty<RevisionNumber|null>}
   */
  latestStableRevNum: computed(
    'sortedRevNums',
    'revisionRegistry',
    function latestStableRevNum() {
      const {
        sortedRevNums,
        revisionRegistry,
      } = this.getProperties('sortedRevNums', 'revisionRegistry');

      for (const revisionNumber of sortedRevNums) {
        if (revisionRegistry[revisionNumber].state === 'stable') {
          return revisionNumber;
        }
      }
      return null;
    }
  ),

  /**
   * @type {ComputedProperty<Array<RevisionNumber>>}
   */
  revNumsBetweenStableAndLatest: computed(
    'latestStableRevNum',
    'sortedRevNums',
    function revNumsBetweenStableAndLatest() {
      const {
        latestStableRevNum,
        sortedRevNums,
      } = this.getProperties('latestStableRevNum', 'sortedRevNums');

      // sliceStartIdx is 1 to omit the latest revision
      const sliceStartIdx = 1;
      const sliceEndIdx = latestStableRevNum === null ?
        sortedRevNums.length :
        sortedRevNums.indexOf(latestStableRevNum);
      return sortedRevNums.slice(sliceStartIdx, sliceEndIdx);
    }
  ),

  /**
   * @type {ComputedProperty<Array<RevisionNumber>>}
   */
  revNumsBeforeStable: computed(
    'latestStableRevNum',
    'sortedRevNums',
    function revNumsBeforeStable() {
      const {
        latestStableRevNum,
        sortedRevNums,
      } = this.getProperties('latestStableRevNum', 'sortedRevNums');

      if (latestStableRevNum === null) {
        return [];
      }

      const latestStableRevNumIdx = sortedRevNums.indexOf(latestStableRevNum);
      return latestStableRevNumIdx > -1 ?
        sortedRevNums.slice(latestStableRevNumIdx + 1) : [];
    }
  ),
});
