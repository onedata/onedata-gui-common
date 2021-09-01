/**
 * Shows run number and status of a lane run.
 *
 * @module components/workflow-visualiser/lane/run-indicator
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/workflow-visualiser/lane/run-indicator';
import { computed } from '@ember/object';
import { normalizeLaneStatus, translateLaneStatus } from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['run-indicator'],
  classNameBindings: [
    'statusClass',
    'digitsNoClass',
    'isActive:active',
    'click:clickable',
  ],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.runIndicator',

  /**
   * @virtual
   * @type {String}
   */
  status: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  runNo: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  sourceRunNo: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isActive: false,

  /**
   * @type {ComputedProperty<String>}
   */
  normalizedStatus: computed('status', function normalizedStatus() {
    return normalizeLaneStatus(this.get('status'));
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  statusClass: tag `status-${'normalizedStatus'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  runNoText: computed('runNo', function runNoText() {
    const runNo = this.get('runNo');
    return Number.isInteger(runNo) && runNo > 0 ? String(runNo) : '?';
  }),

  /**
   * @type {ComputedProperty<String|null>}
   */
  sourceRunNoText: computed('sourceRunNo', function sourceRunNoText() {
    const sourceRunNo = this.get('sourceRunNo');
    return Number.isInteger(sourceRunNo) && sourceRunNo > 0 ?
      String(sourceRunNo) : null;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  statusText: computed('normalizedStatus', function statusText() {
    const {
      i18n,
      normalizedStatus,
    } = this.getProperties('i18n', 'normalizedStatus');
    return translateLaneStatus(i18n, normalizedStatus);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  digitsNoClass: computed('runNoText', function digitsNoClass() {
    let digitsCount;
    const runNoTextLength = this.get('runNoText').length;
    if (runNoTextLength === 1) {
      digitsCount = 'one';
    } else if (runNoTextLength === 2) {
      digitsCount = 'two';
    } else {
      digitsCount = 'many';
    }

    return `${digitsCount}-digit-run`;
  }),
});
