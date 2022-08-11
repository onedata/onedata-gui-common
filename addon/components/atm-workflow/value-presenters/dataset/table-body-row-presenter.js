import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/dataset/table-body-row-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { DatasetDetails } from './visual-presenter';

export default Component.extend(I18n, {
  layout,
  tagName: 'tr',
  classNames: ['table-body-row-presenter', 'dataset-table-body-row-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.dataset.tableBodyRowPresenter',

  /**
   * @virtual
   * @type {AtmDataset}
   */
  value: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<FileDetails>}
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
