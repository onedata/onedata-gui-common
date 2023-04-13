/**
 * Contains things common for dashboard editor elements/tools.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {'chartsDashboardEditorChart' | 'chartsDashboardEditorSection'} ElementType
 * Values are so long because are used to distinguish dragged elements from
 * other elements in the GUI.
 */

/**
 * @typedef {Object<string, ElementType>}
 */
export const ElementType = Object.freeze({
  Chart: 'chartsDashboardEditorChart',
  Section: 'chartsDashboardEditorSection',
});
