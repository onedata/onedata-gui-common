/**
 * A default array item creator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import ArrayItemCreatorBase from '../commons/array-item-creator-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/array/default-item-creator';

export default ArrayItemCreatorBase.extend(I18n, {
  layout,
  tagName: 'a',
  classNames: ['add-item-trigger', 'action-link', 'default-array-item-creator'],
  classNameBindings: ['isDisabled:hidden:clickable'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.array.defaultItemCreator',

  /**
   * @override
   */
  click() {
    this._super(...arguments);

    if (!this.stateManager || !this.itemAtmDataSpec || this.isDisabled) {
      return;
    }

    const newItemEditorState =
      this.stateManager.createValueEditorState(this.itemAtmDataSpec);
    this.onItemsCreated?.([newItemEditorState]);
  },
});
