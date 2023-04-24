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

/**
 * @typedef {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} SectionElement
 */

/**
 * @param {DashboardElement} elementType
 * @returns {boolean}
 */
export function isSectionElementType(elementType) {
  return elementType === ElementType.Section ||
    elementType === ElementType.Chart;
}

/**
 * @typedef {Utils.AtmWorkflow.ChartsDashboardEditor.Axis | Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup | Utils.AtmWorkflow.ChartsDashboardEditor.Series} ChartElement
 */

/**
 * @param {DashboardElement} elementType
 * @returns {boolean}
 */
export function isChartElementType(elementType) {
  return elementType === ElementType.Axis ||
    elementType === ElementType.SeriesGroup ||
    elementType === ElementType.Series;
}

/**
 * @typedef {SectionElement | ChartElement} DashboardElement
 */

/**
 * @typedef {Object} ViewState
 * @property {SectionElement | null} selectedSectionElement
 * @property {boolean} isChartEditorActive
 * @property {ChartElement | null} selectedChartElement
 */

/**
 * @typedef {Object} ViewStateChange
 * @property {DashboardElement} [elementToSelect]
 * @property {boolean} [isChartEditorActive] If provided `elementToSelect` is a
 *   chart and you want to open its editor, then set this flag to `true`.
 * @property {Array<DashboardElement>} [elementsToDeselect]
 */
