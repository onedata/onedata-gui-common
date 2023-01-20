import { computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/file/editor';
import EditorBase from '../commons/editor-base';

export default EditorBase.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.file.editor',

  /**
   * @type {AtmFile|null}
   */
  value: null,

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {FileValueEditorStateMode}
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
        'fileId',
        this.editorState.idFormFile?.file_id || ''
      );
    }
  },

  /**
   * @returns {void}
   */
  propagateIdFormValueChange() {
    this.editorState.idFormFile = {
      file_id: this.idFormRootGroup.valuesSource.fileId,
    };
  },

  actions: {
    filesSelected([file]) {
      this.editorState.value = file;
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
   * @type {Components.AtmWorkflow.ValueEditors.File.Editor}
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
  fields: computed(() => [
    TextField.create({
      name: 'fileId',
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
