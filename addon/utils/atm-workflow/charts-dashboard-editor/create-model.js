/**
 * A set of functions which are responsible for creating editor model (from
 * gived spec of from scratch).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from './model';
import Section from './section';

/**
 * Converts raw charts dashboard spec into a model used by dashboard editor.
 * @param {AtmTimeSeriesDashboardSpec | null} dashboardSpec
 * @returns {Utils.AtmWorkflow.ChartsDashboardSpec.Model}
 */
export function createModelFromSpec(dashboardSpec) {
  const rootSection = dashboardSpec?.rootSection ?
    createSectionModelFromSpec(dashboardSpec.rootSection, true) : null;

  return Model.create({
    rootSection,
  });
}

/**
 * @param {Partial<OneTimeSeriesChartsSectionSpec>} sectionSpec
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardSpec.Section}
 */
export function createSectionModelFromSpec(sectionSpec, isRoot = false) {
  return Section.create({
    isRoot,
    title: sectionSpec.title ?? '',
    titleTip: sectionSpec.titleTip ?? '',
    description: sectionSpec.description ?? '',
    sections: sectionSpec.sections
      ?.filter(Boolean)
      .map((sectionSpec) => createSectionModelFromSpec(sectionSpec)) ?? [],
  });
}
