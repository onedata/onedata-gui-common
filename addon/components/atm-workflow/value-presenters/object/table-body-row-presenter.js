import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/object/table-body-row-presenter';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-body-row-presenter', 'object-table-body-row-presenter'],

  /**
   * @virtual
   * @type {AtmObject}
   */
  value: undefined,

  /**
   * @virtual optional
   * @type {Array<string>}
   */
  columns: undefined,

  /**
   * @type {ComputedProperty<(propertyName: string) => string>}
   */
  stringifyObjectProperty: computed('value', function stringifyObjectProperty() {
    const isValidObject = typeof this.value === 'object' &&
      this.value !== null &&
      !Array.isArray(this.value);
    return (propertyName) => {
      if (!isValidObject || this.value[propertyName] === undefined) {
        return '–';
      }

      return JSON.stringify(this.value[propertyName]);
    };
  }),
});
