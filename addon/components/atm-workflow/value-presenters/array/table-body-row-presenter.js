import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/array/table-body-row-presenter';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-body-row-presenter', 'array-table-body-row-presenter'],

  /**
   * @virtual
   * @type {AtmArray}
   */
  value: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,
});
