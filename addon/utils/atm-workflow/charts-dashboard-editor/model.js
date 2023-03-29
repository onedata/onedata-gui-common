import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardSpec.Section | null}
   */
  rootSection: null,

  /**
   * @override
   */
  willDestroy() {
    try {
      this.rootSection?.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
