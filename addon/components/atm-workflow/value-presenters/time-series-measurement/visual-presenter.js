import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/time-series-measurement/visual-presenter';

export default Component.extend(I18n, {
  layout,
  classNames: ['visual-presenter', 'time-series-measurement-visual-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.timeSeriesMeasurement.visualPresenter',

  /**
   * @virtual
   * @type {AtmTimeSeriesMeasurement}
   */
  value: undefined,
});
