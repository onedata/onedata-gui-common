import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/commons/raw-presenter-base';

export default Component.extend({
  layout,
  classNames: ['raw-presenter'],

  /**
   * @type {unknown}
   */
  value: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedRawValue: computed('value', function stringifiedRawValue() {
    return JSON.stringify(this.value, null, 2);
  }),
});
