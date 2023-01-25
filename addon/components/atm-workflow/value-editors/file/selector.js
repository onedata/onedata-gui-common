import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { Promise } from 'rsvp';
import Action from 'onedata-gui-common/utils/action';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/file/selector';

export default Component.extend({
  layout,
  tagName: 'a',
  classNames: ['file-value-editor-selector', 'action-link', 'clickable'],

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  atmDataSpec: undefined,

  /**
   * @virtual
   * @type {ValueEditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual
   * @type {(files: Array<AtmFile>) => void}
   */
  onFilesSelected: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onIdProvidingStarted: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowManyFiles: false,

  /**
   * @type {boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<AtmFileType>}
   */
  allowedAtmFileType: computed('atmDataSpec', function allowedAtmFileType() {
    return this.atmDataSpec?.valueConstraints?.fileType ?? AtmFileType.Any;
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  selectUploadFilesAction: computed(
    'allowManyFiles',
    'allowedAtmFileType',
    'editorContext.selectFiles',
    function selectUploadFilesAction() {
      const action = SelectUploadFilesAction.create({
        ownerSource: this,
        allowManyFiles: this.allowManyFiles,
        allowedAtmFileType: this.allowedAtmFileType,
        selectFilesFunction: this.editorContext?.selectFiles,
      });
      action.addExecuteHook((result) => {
        const selectedFiles = result.result;
        if (selectedFiles?.length) {
          this.onFilesSelected(selectedFiles);
        }
      });
      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  provideFileIdAction: computed(
    'onIdProvidingStarted',
    function provideFileIdAction() {
      const action = ProvideFileIdAction.create({ ownerSource: this });
      action.addExecuteHook(() => {
        this.onIdProvidingStarted();
      });
      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  actionsArray: collect('selectUploadFilesAction', 'provideFileIdAction'),

  /**
   * @override
   */
  click() {
    this._super(...arguments);
    this.toggleProperty('areActionsOpened');
  },

  actions: {
    toggleActionsOpen(state) {
      this.set('areActionsOpened', state);
    },
  },
});

const SelectUploadFilesAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.file.selector.actions.selectUploadFiles',

  /**
   * @virtual
   * @type {{ allowManyFiles: boolean, allowedAtmFileType: AtmFileType, selectFilesFunction?: (selectorConfig: FilesSelectorConfig) => void }}
   */
  context: undefined,

  /**
   * @override
   */
  className: 'select-upload-files-action-trigger',

  /**
   * @type {boolean}
   */
  isPending: false,

  /**
   * @override
   */
  title: computed('allowManyFiles', function title() {
    return this.t(`title.${this.allowManyFiles ? 'multi' : 'single'}`);
  }),

  /**
   * @override
   */
  disabled: computed('selectFilesFunction', 'isPending', function disabled() {
    return !this.selectFilesFunction || this.isPending;
  }),

  /**
   * @override
   */
  tip: computed('selectFilesFunction', function tip() {
    if (!this.selectFilesFunction) {
      return this.t('disabledTip');
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  allowManyFiles: reads('context.allowManyFiles'),

  /**
   * @type {ComputedProperty<AtmFileType>}
   */
  allowedAtmFileType: reads('context.allowedAtmFileType'),

  /**
   * @type {((selectorConfig: FilesSelectorConfig) => void) | undefined}
   */
  selectFilesFunction: reads('context.selectFilesFunction'),

  /**
   * @override
   */
  async onExecute() {
    if (!this.selectFilesFunction) {
      return [];
    }

    try {
      this.set('isPending', true);
      return await new Promise((resolve) => {
        this.selectFilesFunction({
          atmFileType: this.allowedAtmFileType,
          allowMany: this.allowManyFiles,
          onSelected: (files) => resolve(files),
          onCancelled: () => resolve([]),
        });
      });
    } finally {
      this.set('isPending', false);
    }
  },
});

const ProvideFileIdAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.file.selector.actions.provideFileId',

  /**
   * @override
   */
  className: 'provide-file-id-action-trigger',

  /**
   * @override
   */
  onExecute() {},
});
