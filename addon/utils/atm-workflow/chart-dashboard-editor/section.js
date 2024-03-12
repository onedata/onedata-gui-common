/**
 * Model of a single section for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import _ from 'lodash';
import { ChartNavigation } from 'onedata-gui-common/utils/time-series-dashboard';
import ElementBase from './element-base';
import { ElementType } from './common';

const Section = ElementBase.extend({
  /**
   * @override
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
   * @type {Utils.TimeSeriesDashboard.ChartNavigation}
   */
  chartNavigation: ChartNavigation.Independent,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.Chart>}
   */
  charts: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.Section>}
   */
  sections: undefined,

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  isSelected: false,

  /**
   * @override
   */
  referencingPropertyNames: Object.freeze(['charts', 'sections', 'parent']),

  /**
   * @override
   */
  nestedValidationErrors: computed(
    'sections.@each.validationErrors',
    'charts.@each.validationErrors',
    function nestedValidationErrors() {
      return _.flatten(
        [...this.sections, ...this.charts]
        .map(({ validationErrors }) => validationErrors)
      );
    }
  ),

  /**
   * @override
   */
  init() {
    if (!this.charts) {
      this.set('charts', []);
    }
    if (!this.sections) {
      this.set('sections', []);
    }

    this._super(...arguments);
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
      if (this.parent) {
        this.set('parent', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  clone() {
    const clonedInstance = Section.create({
      elementOwner: this.elementOwner,
      dataSources: this.dataSources,
      isRoot: this.isRoot,
      title: this.title,
      titleTip: this.titleTip,
      description: this.description,
      chartNavigation: this.chartNavigation,
      charts: this.charts.map((chart) => chart.clone()),
      sections: this.sections.map((section) => section.clone()),
      parent: this.parent,
    });
    [...clonedInstance.sections, ...clonedInstance.charts].forEach((element) => {
      set(element, 'parent', clonedInstance);
    });
    return clonedInstance;
  },

  /**
   * @override
   */
  toJson() {
    return {
      title: {
        content: this.title,
        tip: this.titleTip,
      },
      description: this.description,
      chartNavigation: this.chartNavigation,
      charts: this.charts.map((chart) => chart.toJson()),
      sections: this.sections.map((section) => section.toJson()),
    };
  },

  /**
   * @override
   */
  * nestedElements() {
    for (const element of [...this.sections, ...this.charts]) {
      yield element;
      yield* element.nestedElements();
    }
  },

  /**
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
  },
});

export default Section;
