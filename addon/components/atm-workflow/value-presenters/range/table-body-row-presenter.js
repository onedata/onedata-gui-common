import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/range/table-body-row-presenter';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-body-row-presenter', 'range-table-body-row-presenter'],

  /**
   * @virtual
   * @type {AtmRange}
   */
  value: undefined,
});
