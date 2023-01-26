/**
 * A dataset value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { tag, not } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/dataset/editor';
import EditorBase from '../commons/editor-base';

export default EditorBase.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.dataset.editor',

  /**
   * @type {AtmDataset|null}
   */
  value: null,

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {DatasetValueEditorStateMode}
   */
  mode: 'empty',

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  idFormRootGroup: computed(function formRootGroup() {
    return IdFormRootGroup.create({ component: this });
  }),

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
        'datasetId',
        this.editorState.idFormDataset?.datasetId || ''
      );
    }
  },

  /**
   * @returns {void}
   */
  propagateIdFormValueChange() {
    this.editorState.idFormDataset = {
      datasetId: this.idFormRootGroup.valuesSource.datasetId,
    };
  },

  actions: {
    datasetsSelected([dataset]) {
      this.editorState.value = dataset;
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
   * @type {Components.AtmWorkflow.ValueEditors.Dataset.Editor}
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
      name: 'datasetId',
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
