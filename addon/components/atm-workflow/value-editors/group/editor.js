/**
 * A group value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { tag, not } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/group/editor';
import EditorBase from '../commons/editor-base';

export default EditorBase.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.group.editor',

  /**
   * @type {AtmGroup|null}
   */
  value: null,

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {GroupValueEditorStateMode}
   */
  mode: 'empty',

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  idFormRootGroup: computed(function idFormRootGroup() {
    return IdFormRootGroup.create({ component: this });
  }),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.idFormRootGroup.destroy?.();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  handleStateChange() {
    this._super(...arguments);
    if (!this.editorState) {
      return;
    }

    this.setProperties({
      value: this.editorState.value,
      isValid: this.editorState.isValid,
      mode: this.editorState.mode,
    });
    if (this.mode === 'idForm') {
      set(
        this.idFormRootGroup.valuesSource,
        'groupId',
        this.editorState.idFormGroup?.groupId || ''
      );
    }
  },

  /**
   * @returns {void}
   */
  propagateIdFormValueChange() {
    this.editorState.idFormGroup = {
      groupId: this.idFormRootGroup.valuesSource.groupId,
    };
  },

  actions: {
    groupsSelected([group]) {
      this.editorState.value = group;
    },
    idProvidingStarted() {
      this.editorState.showIdForm();
    },
    cancelIdForm() {
      this.editorState.cancelIdForm();
    },
    acceptIdForm() {
      this.editorState.acceptIdForm();
    },
  },
});

const IdFormRootGroup = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ValueEditors.Group.Editor}
   */
  component: undefined,

  /**
   * @override
   */
  i18nPrefix: tag`${'component.i18nPrefix'}.idForm`,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  isEnabled: not('component.isDisabled'),

  /**
   * @override
   */
  fields: computed(() => [
    TextField.create({
      name: 'groupId',
      withValidationMessage: false,
    }),
  ]),

  /**
   * @override
   */
  onValueChange() {
    this._super(...arguments);
    scheduleOnce('afterRender', this.component, 'propagateIdFormValueChange');
  },
});
