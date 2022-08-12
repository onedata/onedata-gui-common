import TableHeaderRowPresenterBase from '../commons/table-header-row-presenter-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/range/table-header-row-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TableHeaderRowPresenterBase.extend(I18n, {
  layout,
  classNames: ['range-table-header-row-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.range.tableHeaderRowPresenter',
});
