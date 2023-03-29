/**
 * A set of functions which are responsible for creating editor model (from
 * gived spec of from scratch).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import Model from './model';
import Section from './section';

/**
 * @type {string}
 */
const i18nPrefix = 'utils.atmWorkflow.chartsDashboardEditor.createModel';

/**
 * Converts raw charts dashboard spec into a model used by dashboard editor.
 * @param {AtmTimeSeriesDashboardSpec | null} dashboardSpec
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Model}
 */
export function createModelFromSpec(dashboardSpec) {
  const rootSection = dashboardSpec?.rootSection ?
    createSectionModelFromSpec(dashboardSpec.rootSection, true) : null;

  return Model.create({
    rootSection,
  });
}

/**
 * Returns new, empty section.
 * @param {Ember.Service} i18n
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
export function createNewSection(i18n, isRoot = false) {
  return createSectionModelFromSpec({
    title: String(i18n.t(`${i18nPrefix}.newSection.title`)),
  }, isRoot);
}

/**
 * @param {Partial<OneTimeSeriesChartsSectionSpec>} sectionSpec
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
function createSectionModelFromSpec(sectionSpec, isRoot = false) {
  const section = Section.create({
    isRoot,
    title: sectionSpec.title ?? '',
    titleTip: sectionSpec.titleTip ?? '',
    description: sectionSpec.description ?? '',
    sections: sectionSpec.sections
      ?.filter(Boolean)
      .map((sectionSpec) => createSectionModelFromSpec(sectionSpec)) ?? [],
  });
  section.sections.forEach((subsection) => set(subsection, 'parentSection', section));
  return section;
}
