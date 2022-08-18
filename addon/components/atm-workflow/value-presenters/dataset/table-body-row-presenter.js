import TableBodyRowPresenterBase from '../commons/table-body-row-presenter-base';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/dataset/table-body-row-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { DatasetDetails } from './visual-presenter';

export default TableBodyRowPresenterBase.extend(I18n, {
  layout,
  classNames: ['dataset-table-body-row-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.dataset.tableBodyRowPresenter',

  /**
   * @type {DatasetDetails|undefined}
   */
  datasetDetailsCache: undefined,

  /**
   * @type {ComputedProperty<DatasetDetails>}
   */
  datasetDetails: computed('value', 'context', function datasetDetails() {
    if (
      !this.datasetDetailsCache ||
      !_.isEqual(this.value, this.datasetDetailsCache.dataset)
    ) {
      this.set('datasetDetailsCache', DatasetDetails.create({
        dataset: this.value,
        context: this.context,
      }));
    }
    return this.datasetDetailsCache;
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
