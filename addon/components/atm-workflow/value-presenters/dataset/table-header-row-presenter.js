import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/dataset/table-header-row-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  tagName: 'tr',
  classNames: ['table-header-row-presenter', 'dataset-table-header-row-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.dataset.tableHeaderRowPresenter',
});
