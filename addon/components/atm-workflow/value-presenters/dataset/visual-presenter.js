import Component from '@ember/component';
import { computed } from '@ember/object';
import { promise, conditional, eq, raw } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/dataset/visual-presenter';
import { FileType } from 'onedata-gui-common/utils/file';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['visual-presenter', 'dataset-visual-presenter', 'details-with-icon'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.dataset.visualPresenter',

  /**
   * @virtual
   * @type {AtmFile}
   */
  value: undefined,

  /**
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<string|null>}
   */
  name: computed('value', function name() {
    const pathElements = (this.value?.rootFilePath || '').split('/');
    return pathElements[pathElements.length - 1] ?? null;
  }),

  /**
   * @type {ComputedProperty<FileType.Regular|FileType.Directory>}
   */
  rootFileType: computed('value', function rootFileType() {
    switch (this.value?.rootFileType) {
      case FileType.Directory:
      case FileType.Regular:
        return this.value.rootFileType;
      default:
        return FileType.Regular;
    }
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  icon: conditional(
    eq('rootFileType', raw(FileType.Directory)),
    raw('browser-dataset'),
    raw('browser-dataset-file'),
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  iconClass: conditional(
    eq('rootFileType', raw(FileType.Directory)),
    raw('main-type-directory'),
    raw('main-type-regular'),
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  urlProxy: promise.object(
    computed('value', 'context', async function urlProxy() {
      if (!this.value?.datasetId) {
        return null;
      }

      return this.context?.getDatasetUrlById?.(this.value.datasetId) ?? null;
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  rootFileUrlProxy: promise.object(
    computed('value', 'context', async function rootFileUrlProxy() {
      if (!this.value?.rootFileId) {
        return null;
      }

      return this.context?.getFileUrlById?.(this.value.rootFileId) ?? null;
    })
  ),
});
