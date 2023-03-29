import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
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
