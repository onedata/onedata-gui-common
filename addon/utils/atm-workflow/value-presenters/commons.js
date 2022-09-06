/**
 * Contains typedefs and constants common for to automation value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} ValuePresentersSpecification
 * @property {string} singleLineValuePresenter
 * @property {string} rawValuePresenter
 * @property {string} [visualValuePresenter]
 * @property {string} tableHeaderRowValuePresenter
 * @property {string} tableBodyRowValuePresenter
 * @property {(columns: Array<string>|undefined) => number} getTableValuePresenterColumnsCount
 */

export const valuePresentersDefaultLocation = 'atm-workflow/value-presenters';
