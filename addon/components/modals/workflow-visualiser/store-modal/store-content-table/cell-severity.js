/**
 * Shows formatted auditlog entry severity.
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/cell-severity
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/cell-severity';
import _ from 'lodash';

const severityIcons = {
  debug: 'browser-info',
  info: 'browser-info',
  notice: 'browser-info',
  warning: 'checkbox-filled-warning',
  alert: 'checkbox-filled-warning',
  error: 'checkbox-filled-x',
  critical: 'checkbox-filled-x',
  emergency: 'checkbox-filled-x',
  unknown: 'unknown',
};

export default Component.extend({
  layout,
  classNames: ['custom-cell-severity'],

  /**
   * @virtual
   * @type {String}
   */
  value: undefined,

  /**
   * @type {Object}
   */
  iconsMapping: severityIcons,

  /**
   * @type {ComputedProperty<String>}
   */
  severity: computed('value', function severity() {
    const value = this.get('value');
    if (typeof value !== 'string') {
      return '–';
    }
    return _.upperFirst(value);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  icon: computed('value', 'iconsMapping', function icon() {
    const {
      value,
      iconsMapping,
    } = this.getProperties('value', 'iconsMapping');
    return iconsMapping[value] || iconsMapping['unknown'];
  }),
});
