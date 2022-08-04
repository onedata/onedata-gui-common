import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/commons/single-line-presenter-base';

export default Component.extend({
  tagName: 'span',
  layout,
  classNames: ['single-line-presenter'],

  /**
   * @virtual
   * @type {unknown}
   */
  value: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    return JSON.stringify(this.value);
  }),
});
