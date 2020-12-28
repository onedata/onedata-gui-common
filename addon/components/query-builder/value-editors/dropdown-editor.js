/**
 * Select predefined values for query property
 * 
 * @module components/query-builder/value-editors/dropdown-editor
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EditorBaseComponent from 'onedata-gui-common/components/query-builder/value-editors/-base-editor';
import layout from '../../../templates/components/query-builder/value-editors/dropdown-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { next } from '@ember/runloop';

export default EditorBaseComponent.extend(I18n, {
  layout,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.queryBuilder.valueEditors.dropdownEditor',

  /**
   * @type {ComputedProperty<String>}
   */
  guid: computed(function guid() {
    return guidFor(this);
  }),

  didInsertElement() {
    this._super(...arguments);
    if (this.get('initiallyFocused')) {
      next(() => {
        const trigger = document.querySelector(`.${this.get('guid')}.ember-power-select-trigger`);
        const mouseDownEvent = new MouseEvent('mousedown');
        trigger.dispatchEvent(mouseDownEvent);
      });
    }
  },

  actions: {
    onSelectorBlur({ isOpen, isActive }) {
      if (isOpen && isActive) {
        return;
      }
      this.get('onFinishEdit')();
    },
  },
});
