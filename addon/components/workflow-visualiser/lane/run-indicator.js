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
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

export default Component.extend(I18n, {
  layout,
  classNames: ['run-indicator'],
  classNameBindings: [
    'statusClass',
    'digitsNoClass',
    'isSelected:selected',
    'onClick:clickable',
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
   * @type {AtmLaneRunNo}
   */
  runNo: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  sourceRunNo: undefined,

  /**
   * @virtual
   * @type {String}
   */
  runType: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isSelected: false,

  /**
   * @virtual optional
   * @type {Function}
   */
  onClick: undefined,

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
   * @type {ComputedProperty<Boolean>}
   */
  isRunNoAValidNumber: computed('runNo', function isRunNoAValidNumber() {
    const runNo = this.get('runNo');
    return Number.isInteger(runNo) && runNo > 0;
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isSourceRunNoValid: computed('sourceRunNo', function isSourceRunNoValid() {
    const sourceRunNo = this.get('sourceRunNo');
    return Number.isInteger(sourceRunNo) && sourceRunNo > 0;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  runNoText: computed('runNo', 'isRunNoAValidNumber', function runNoText() {
    const {
      runNo,
      isRunNoAValidNumber,
    } = this.getProperties('runNo', 'isRunNoAValidNumber');
    return isRunNoAValidNumber ? String(runNo) : '?';
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  sourceRunNoText: computed(
    'sourceRunNo',
    'isSourceRunNoValid',
    function sourceRunNoText() {
      const {
        sourceRunNo,
        isSourceRunNoValid,
      } = this.getProperties('sourceRunNo', 'isSourceRunNoValid');
      return isSourceRunNoValid ? String(sourceRunNo) : '?';
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isSourceRunNoVisible: computed(
    'runNo',
    'sourceRunNo',
    'isRunNoAValidNumber',
    'isSourceRunNoValid',
    'areActionsOpened',
    function isSourceRunNoVisible() {
      const {
        runNo,
        sourceRunNo,
        isRunNoAValidNumber,
        isSourceRunNoValid,
        areActionsOpened,
      } = this.getProperties(
        'runNo',
        'sourceRunNo',
        'isRunNoAValidNumber',
        'isSourceRunNoValid',
        'areActionsOpened'
      );

      return !areActionsOpened &&
        isSourceRunNoValid &&
        (!isRunNoAValidNumber || runNo - sourceRunNo !== 1);
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  statusText: computed('normalizedStatus', function statusText() {
    const {
      i18n,
      normalizedStatus,
    } = this.getProperties('i18n', 'normalizedStatus');
    return String(translateLaneStatus(i18n, normalizedStatus)).toLocaleLowerCase();
  }),

  /**
   * @type {ComputedProperty<SafeString|null>}
   */
  runTypeText: computed('runType', function runTypeText() {
    const runType = this.get('runType');
    return runType ? this.t(`runType.${runType}`, {}, { defaultValue: null }) : null;
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

  /**
   * @override
   */
  click(event) {
    this._super(...arguments);

    const {
      onClick,
      element,
    } = this.getProperties('onClick', 'element');

    if (isDirectlyClicked(event, element) && onClick) {
      onClick();
    }
  },
});
