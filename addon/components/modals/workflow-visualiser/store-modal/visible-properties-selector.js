/**
 * Selector component, which allows to choose which object properties should
 * be rendered in store presenters. For now it is used by the store types below:
 * - list,
 * - exception.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/visible-properties-selector';
import ListPresenter from './list-presenter';

export default ListPresenter.extend({
  layout,
  classNames: ['visible-properties-selector'],

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.visiblePropertiesSelector',

  /**
   * @virtual
   * @type {Array<string>}
   */
  availableProperties: undefined,

  /**
   * @virtual
   * @type {Array<string>}
   */
  visibleProperties: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isMaxPropertiesCountReached: false,

  /**
   * @virtual
   * @type {(property: string) => void}
   */
  onTogglePropertyVisibility: undefined,
});
