/**
 * A "visual" dataset value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualPresenterBase from '../commons/visual-presenter-base';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise, conditional, eq, raw, or } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/dataset/visual-presenter';
import { FileType } from 'onedata-gui-common/utils/file';
import { getDatasetNameFromRootFilePath } from 'onedata-gui-common/utils/dataset';

export default VisualPresenterBase.extend({
  layout,
  classNames: ['details-with-icon'],

  /**
   * @override
   */
  dataSpecType: 'dataset',

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
  rootFilePath: reads('datasetDetails.rootFilePath'),

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
   * @type {ComputedProperty<PromiseObject<AtmDataset>>}
   */
  datasetWithDetailsProxy: promise.object(
    computed('dataset', 'context', async function datasetWithDetailsProxy() {
      if (
        this.dataset?.datasetId && (
          !this.dataset?.rootFileId ||
          !this.dataset?.rootFilePath ||
          !this.dataset?.rootFileType
        ) && this.context?.getDatasetDetailsById
      ) {
        try {
          return (await this.context.getDatasetDetailsById(this.dataset.datasetId)) ||
            this.dataset;
        } catch {
          return this.dataset;
        }
      } else {
        return this.dataset;
      }
    })
  ),

  /**
   * @type {ComputedProperty<string|null>}
   */
  rootFilePath: or(
    'dataset.rootFilePath',
    'datasetWithDetailsProxy.content.rootFilePath',
    raw(null)
  ),

  /**
   * @type {ComputedProperty<string|null>}
   */
  name: computed('rootFilePath', function name() {
    return getDatasetNameFromRootFilePath(this.rootFilePath);
  }),

  /**
   * @type {ComputedProperty<FileType.Regular|FileType.Directory>}
   */
  rootFileType: computed(
    'dataset.rootFileType',
    'datasetWithDetailsProxy.content.rootFileType',
    function rootFileType() {
      const fileType = this.dataset?.rootFileType ??
        this.datasetWithDetailsProxy.content?.rootFileType;
      switch (fileType) {
        case FileType.Directory:
        case FileType.Regular:
          return fileType;
        default:
          return FileType.Regular;
      }
    }
  ),

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
  rootFileUrlProxy: promise.object(computed(
    'dataset.rootFileId',
    'datasetWithDetailsProxy.content.rootFileId',
    'context',
    async function rootFileUrlProxy() {
      const rootFileId = this.dataset?.rootFileId ??
        this.datasetWithDetailsProxy.content?.rootFileId;
      if (!rootFileId) {
        return null;
      }

      return this.context?.getFileUrlById?.(rootFileId) ?? null;
    }
  )),
});
