/**
 * Model of a single section for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { ElementType } from './common';

const Section = EmberObject.extend({
  /**
   * @public
   * @readonly
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType.Section}
   */
  elementType: ElementType.Section,

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
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Chart>}
   */
  charts: undefined,

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
    if (!this.charts) {
      this.set('charts', []);
    }
    if (!this.sections) {
      this.set('sections', []);
    }
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.charts.length) {
        this.charts.forEach((chart) => chart.destroy());
        this.set('charts', []);
      }
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
      charts: this.charts.map((chart) => chart.clone()),
      sections: this.sections.map((section) => section.clone()),
      parentSection: this.parentSection,
    });
  },
});

export default Section;
