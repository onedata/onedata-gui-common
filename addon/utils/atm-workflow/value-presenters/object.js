/**
 * Contains specification of `object` value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { valuePresentersDefaultLocation } from './commons';

/**
 * @type {ValuePresentersSpecification}
 */
export default {
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/object/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/object/raw-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/object/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/object/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: (columns) =>
    Array.isArray(columns) && columns.length ? columns.length : 1,
};
