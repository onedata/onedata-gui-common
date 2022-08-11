import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
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
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<DatasetDetails>}
   */
  datasetDetails: computed('value', 'context', function datasetDetails() {
    return DatasetDetails.create({
      dataset: this.value,
      context: this.context,
    });
  }),

  /**
   * @type {ComputedProperty<string|null>}
   */
  name: reads('datasetDetails.name'),

  /**
   * @type {ComputedProperty<string>}
   */
  icon: reads('datasetDetails.icon'),

  /**
   * @type {ComputedProperty<string>}
   */
  iconClass: reads('datasetDetails.iconClass'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  urlProxy: reads('datasetDetails.urlProxy'),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  rootFileUrlProxy: reads('datasetDetails.rootFileUrlProxy'),
});

export const DatasetDetails = EmberObject.extend({
  /**
   * @virtual
   * @type {AtmDataset}
   */
  dataset: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<string|null>}
   */
  name: computed('dataset', function name() {
    const pathElements = (this.dataset?.rootFilePath || '').split('/');
    return pathElements[pathElements.length - 1] ?? null;
  }),

  /**
   * @type {ComputedProperty<FileType.Regular|FileType.Directory>}
   */
  rootFileType: computed('dataset', function rootFileType() {
    switch (this.dataset?.rootFileType) {
      case FileType.Directory:
      case FileType.Regular:
        return this.dataset.rootFileType;
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
    computed('dataset', 'context', async function urlProxy() {
      if (!this.dataset?.datasetId) {
        return null;
      }

      return this.context?.getDatasetUrlById?.(this.dataset.datasetId) ?? null;
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string|null>>}
   */
  rootFileUrlProxy: promise.object(
    computed('dataset', 'context', async function rootFileUrlProxy() {
      if (!this.dataset?.rootFileId) {
        return null;
      }

      return this.context?.getFileUrlById?.(this.dataset.rootFileId) ?? null;
    })
  ),
});
