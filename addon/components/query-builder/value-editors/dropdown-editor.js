import EditorBaseComponent from 'onedata-gui-common/components/query-builder/value-editors/-base-editor';
import layout from '../../../templates/components/query-builder/value-editors/dropdown-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';

export default EditorBaseComponent.extend(I18n, {
  layout,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.queryBuilder.valueEditors.dropdownEditor',

  guid: computed(function guid() {
    return guidFor(this);
  }),

  actions: {
    onSelectorBlur({ isOpen, isActive }) {
      if (isOpen && isActive) {
        return;
      }
      this.get('onFinishEdit')();
    },
  },
});
