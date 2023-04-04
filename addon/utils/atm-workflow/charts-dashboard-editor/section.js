import EmberObject from '@ember/object';

export const SectionElementType = 'chartsDashboardEditorSection';

const Section = EmberObject.extend({
  /**
   * @public
   * @readonly
   * @type {SectionElementType}
   */
  elementType: SectionElementType,

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
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Section>}
   */
  sections: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  parentSection: null,

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
      if (this.sections.length) {
        this.sections.forEach((section) => section.destroy());
        this.set('sections', []);
      }
      if (this.parentSection) {
        this.set('parentSection', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  clone() {
    return Section.create({
      isRoot: this.isRoot,
      title: this.title,
      titleTip: this.titleTip,
      description: this.description,
      sections: this.sections.map((section) => section.clone()),
      parentSection: this.parentSection,
    });
  },
});

export default Section;
