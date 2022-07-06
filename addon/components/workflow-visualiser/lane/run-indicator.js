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
import {
  normalizeLaneStatus,
  translateLaneStatus,
} from 'onedata-gui-common/utils/workflow-visualiser/statuses';
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
   * @type {AtmLaneRunNumber}
   */
  runNumber: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  originRunNumber: undefined,

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
  isRunNumberAValidInteger: computed('runNumber', function isRunNumberAValidInteger() {
    const runNumber = this.get('runNumber');
    return Number.isInteger(runNumber) && runNumber > 0;
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isOriginRunNumberValid: computed('originRunNumber', function isOriginRunNumberValid() {
    const originRunNumber = this.get('originRunNumber');
    return Number.isInteger(originRunNumber) && originRunNumber > 0;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  runNumberText: computed('runNumber', 'isRunNumberAValidInteger', function runNumberText() {
    const {
      runNumber,
      isRunNumberAValidInteger,
    } = this.getProperties('runNumber', 'isRunNumberAValidInteger');
    return isRunNumberAValidInteger ? String(runNumber) : '?';
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  originRunNumberText: computed(
    'originRunNumber',
    'isOriginRunNumberValid',
    function originRunNumberText() {
      const {
        originRunNumber,
        isOriginRunNumberValid,
      } = this.getProperties('originRunNumber', 'isOriginRunNumberValid');
      return isOriginRunNumberValid ? String(originRunNumber) : '?';
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isOriginRunNumberVisible: computed(
    'runNumber',
    'originRunNumber',
    'isRunNumberAValidInteger',
    'isOriginRunNumberValid',
    'areActionsOpened',
    function isOriginRunNumberVisible() {
      const {
        runNumber,
        originRunNumber,
        isRunNumberAValidInteger,
        isOriginRunNumberValid,
        areActionsOpened,
      } = this.getProperties(
        'runNumber',
        'originRunNumber',
        'isRunNumberAValidInteger',
        'isOriginRunNumberValid',
        'areActionsOpened'
      );

      return !areActionsOpened &&
        isOriginRunNumberValid &&
        (!isRunNumberAValidInteger || runNumber - originRunNumber !== 1);
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
  digitsNoClass: computed('runNumberText', function digitsNoClass() {
    let digitsCount;
    const runNumberTextLength = this.get('runNumberText').length;
    if (runNumberTextLength === 1) {
      digitsCount = 'one';
    } else if (runNumberTextLength === 2) {
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
