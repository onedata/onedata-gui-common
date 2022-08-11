import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/time-series-measurement/table-body-row-presenter';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-body-row-presenter', 'time-series-measurement-table-body-row-presenter'],

  /**
   * @virtual
   * @type {AtmTimeSeriesMeasurement}
   */
  value: undefined,
});
