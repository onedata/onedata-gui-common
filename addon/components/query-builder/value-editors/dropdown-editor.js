/**
 * Select predefined values for query property
 *
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
import { array } from 'ember-awesome-macros';

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

  options: array.sort('params.values', (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    } else if (typeof a === 'number' && typeof b === 'string') {
      return -1;
    } else if (typeof a === 'string' && typeof b === 'number') {
      return 1;
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      // for other types - sorting should be provided somewhere else
      return 0;
    }
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
