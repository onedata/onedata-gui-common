import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/string/table-body-row-presenter';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-body-row-presenter', 'string-table-body-row-presenter'],

  /**
   * @virtual
   * @type {AtmString}
   */
  value: undefined,
});
