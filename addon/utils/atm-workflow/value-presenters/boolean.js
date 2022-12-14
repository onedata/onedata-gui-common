/**
 * Contains specification of `boolean` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/boolean/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/boolean/raw-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/boolean/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/boolean/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 1,
};
