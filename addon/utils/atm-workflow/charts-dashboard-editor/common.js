/**
 * Contains things common for dashboard editor elements/tools.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {
 *   'chartsDashboardEditorSection' |
 *   'chartsDashboardEditorChart' |
 *   'chartsDashboardEditorAxis' |
 *   'chartsDashboardEditorSeriesGroup' |
 *   'chartsDashboardEditorSeries'
 * } ElementType
 * Values are so long because are used to distinguish dragged elements from
 * other elements in the GUI.
 */

/**
 * @typedef {Object<string, ElementType>}
 */
export const ElementType = Object.freeze({
  Section: 'chartsDashboardEditorSection',
  Chart: 'chartsDashboardEditorChart',
  Axis: 'chartsDashboardEditorAxis',
  SeriesGroup: 'chartsDashboardEditorSeriesGroup',
  Series: 'chartsDashboardEditorSeries',
});
