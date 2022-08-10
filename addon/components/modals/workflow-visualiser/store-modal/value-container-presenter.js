import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/value-container-presenter';

export default Component.extend({
  layout,
  classNames: ['value-container-presenter'],

  /**
   * @virtual
   * @type {AtmValueContainer}
   */
  valueContainer: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,
});
