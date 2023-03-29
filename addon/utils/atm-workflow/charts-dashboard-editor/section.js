import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * If this is `true` then this section is a root (top) section. There is only
   * one root section in the dashboard and it contains all other sections and
   * charts.
   * @public
   * @virtual optional
   * @type {boolean}
   */
  isRoot: false,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  title: '',

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  titleTip: '',

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  description: '',

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardSpec.Section>}
   */
  sections: undefined,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.sections) {
      this.set('sections', []);
    }
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.sections.forEach((section) => section.destroy());
    } finally {
      this._super(...arguments);
    }
  },
});
