import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/range/visual-presenter';

export default Component.extend(I18n, {
  layout,
  classNames: ['visual-presenter', 'range-visual-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.range.visualPresenter',

  /**
   * @virtual
   * @type {AtmRange}
   */
  value: undefined,
});
