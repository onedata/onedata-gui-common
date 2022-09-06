/**
 * Contains specification of `timeSeriesMeasurement` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/time-series-measurement/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/time-series-measurement/raw-presenter`,
  visualValuePresenter: `${valuePresentersDefaultLocation}/time-series-measurement/visual-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/time-series-measurement/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/time-series-measurement/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 3,
};
