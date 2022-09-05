/**
 * @typedef {Object} ValuePresentersSpecification
 * @property {string} singleLineValuePresenter
 * @property {string} rawValuePresenter
 * @property {string} [visualValuePresenter]
 * @property {string} tableHeaderRowValuePresenter
 * @property {string} tableBodyRowValuePresenters
 * @property {(columns: Array<string>|undefined) => number} getTableValuePresenterColumnsCount
 */

export const valuePresentersDefaultLocation = 'atm-workflow/value-presenters';
