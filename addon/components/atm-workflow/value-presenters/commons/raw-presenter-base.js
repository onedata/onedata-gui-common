/**
 * A base component for all "raw" value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { dasherize } from '@ember/string';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/commons/raw-presenter-base';

export default Component.extend({
  layout,
  classNames: ['raw-presenter'],
  classNameBindings: ['typeClass'],

  /**
   * @type {unknown}
   */
  value: undefined,

  /**
   * @virtual optional
   * @type {AtmDataSpecType}
   */
  dataSpecType: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedRawValue: computed('value', function stringifiedRawValue() {
    return JSON.stringify(this.value, null, 2);
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  typeClass: computed('dataSpecType', function typeClass() {
    const type = this.dataSpecType ?? 'fallback';
    return `${dasherize(type)}-raw-presenter`;
  }),
});
