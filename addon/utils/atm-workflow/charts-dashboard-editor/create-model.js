/**
 * A set of functions which are responsible for creating editor model (from
 * given spec or from scratch).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set, setProperties } from '@ember/object';
import generateId from 'onedata-gui-common/utils/generate-id';
import Model from './model';
import Section from './section';
import Chart from './chart';
import Axis from './axis';
import SeriesGroup from './series-group';
import Series from './series';
import { ElementType } from './common';

/**
 * @type {string}
 */
const i18nPrefix = 'utils.atmWorkflow.chartsDashboardEditor.createModel';

/**
 * Converts raw charts dashboard spec into a model used by dashboard editor.
 * @param {AtmTimeSeriesDashboardSpec | null} dashboardSpec
 * @param {unknown} elementsOwner
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Model}
 */
export function createModelFromSpec(dashboardSpec, elementsOwner) {
  const rootSection = dashboardSpec?.rootSection ?
    createSectionModelFromSpec(dashboardSpec.rootSection, elementsOwner, true) : null;

  return Model.create({
    rootSection,
  });
}

/**
 * Returns new, empty section.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
export function createNewSection(i18n, elementOwner = null, isRoot = false) {
  return createSectionModelFromSpec({
    title: {
      content: String(i18n.t(`${i18nPrefix}.newSection.title`)),
    },
  }, elementOwner, isRoot);
}

/**
 * Returns new, empty chart.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
export function createNewChart(i18n, elementOwner = null) {
  return createChartModelFromSpec({
    title: {
      content: String(i18n.t(`${i18nPrefix}.newChart.title`)),
    },
    yAxes: [{
      id: generateId(),
      name: String(i18n.t(`${i18nPrefix}.newAxis.name`)),
    }],
  }, elementOwner);
}

/**
 * Returns new, empty axis.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
 */
export function createNewAxis(i18n, elementOwner = null) {
  return createAxisModelFromSpec({
    id: generateId(),
    name: String(i18n.t(`${i18nPrefix}.newAxis.name`)),
  }, elementOwner);
}

/**
 * Returns new, empty series group.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
 */
export function createNewSeriesGroup(i18n, elementOwner = null) {
  return createSeriesGroupModelFromSpec({
    id: generateId(),
    name: String(i18n.t(`${i18nPrefix}.newSeriesGroup.name`)),
  }, elementOwner);
}

/**
 * Returns new, empty series.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
 */
export function createNewSeries(i18n, elementOwner = null) {
  return createSeriesModelFromSpec({
    builderType: 'static',
    builderRecipe: {
      seriesTemplate: {
        id: generateId(),
        name: String(i18n.t(`${i18nPrefix}.newSeries.name`)),
      },
    },
  }, elementOwner);
}

/**
 * @param {Partial<OneTimeSeriesChartsSectionSpec>} sectionSpec
 * @param {unknown} [elementOwner]
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
function createSectionModelFromSpec(sectionSpec, elementOwner = null, isRoot = false) {
  const section = Section.create({
    elementOwner,
    isRoot,
    title: sectionSpec.title?.content ?? '',
    titleTip: sectionSpec.title?.tip ?? '',
    description: sectionSpec.description ?? '',
    charts: sectionSpec.charts
      ?.filter(Boolean)
      .map((chartSpec) => createChartModelFromSpec(chartSpec, elementOwner)) ?? [],
    sections: sectionSpec.sections
      ?.filter(Boolean)
      .map((subsectionSpec) =>
        createSectionModelFromSpec(subsectionSpec, elementOwner)
      ) ?? [],
  });
  section.charts.forEach((chart) => set(chart, 'parent', section));
  section.sections.forEach((subsection) => set(subsection, 'parent', section));
  return section;
}

/**
 * @param {Partial<OTSCChartDefinition>} chartSpec
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
function createChartModelFromSpec(chartSpec, elementOwner = null) {
  const chart = Chart.create({
    elementOwner,
    title: chartSpec.title?.content ?? '',
    titleTip: chartSpec.title?.tip ?? '',
    axes: chartSpec.yAxes
      ?.filter(Boolean)
      .map((axisSpec) => createAxisModelFromSpec(axisSpec, elementOwner)) ?? [],
    seriesGroups: chartSpec.seriesGroupBuilders
      ?.filter((builder) =>
        builder?.builderType === 'static' &&
        builder.builderRecipe?.seriesGroupTemplate
      )
      .map((builder) => createSeriesGroupModelFromSpec(
        builder.builderRecipe.seriesGroupTemplate,
        elementOwner
      )) ?? [],
  });
  const axesMap = {};
  const groupsMap = {};
  chart.axes.forEach((axis) => {
    axesMap[axis.id] = axis;
    set(axis, 'parent', chart);
  });
  chart.seriesGroups.forEach((seriesGroup) => {
    groupsMap[seriesGroup.id] = seriesGroup;
    set(seriesGroup, 'parent', chart);
    [...seriesGroup.nestedElements()]
    .filter((element) => element.elementType === ElementType.SeriesGroup)
      .forEach((subgroup) => {
        groupsMap[subgroup.id] = subgroup;
        set(subgroup, 'parent', chart);
      });
  });

  set(
    chart,
    'series',
    chartSpec.seriesBuilders
    ?.filter(Boolean)
    .map((seriesSpec) =>
      createSeriesModelFromSpec(seriesSpec, elementOwner, axesMap, groupsMap)
    ) ?? []
  );
  chart.series.forEach((series) => {
    set(series, 'parent', chart);
    if (series.axis) {
      set(series.axis, 'series', [...series.axis.series, series]);
    }
    if (series.group) {
      set(series.group, 'series', [...series.group.series, series]);
    }
  });

  return chart;
}

/**
 * @param {Partial<OTSCRawYAxis>} axisSpec
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
 */
function createAxisModelFromSpec(axisSpec, elementOwner = null) {
  const axis = Axis.create({
    elementOwner,
    id: axisSpec.id,
    name: axisSpec.name,
    unitName: axisSpec.unitName ?? 'none',
    unitOptions: axisSpec.unitOptions ?
      EmberObject.create(axisSpec.unitOptions) : null,
    minInterval: axisSpec.minInterval ?? null,
  });
  return axis;
}

/**
 * @param {Partial<OTSCRawSeriesGroup>} seriesGroupSpec
 * @param {unknown} [elementOwner]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
 */
function createSeriesGroupModelFromSpec(seriesGroupSpec, elementOwner = null) {
  const seriesGroup = SeriesGroup.create({
    elementOwner,
    id: seriesGroupSpec.id,
    name: seriesGroupSpec.name,
    stacked: Boolean(seriesGroupSpec.stacked),
    showSum: Boolean(seriesGroupSpec.showSum),
    seriesGroups: seriesGroupSpec.subgroups
      ?.filter(Boolean)
      .map((subgroupSpec) =>
        createSeriesGroupModelFromSpec(subgroupSpec, elementOwner)
      ) ?? [],
  });
  seriesGroup.seriesGroups.forEach((subgroup) =>
    set(subgroup, 'parent', seriesGroup)
  );
  return seriesGroup;
}

/**
 * @param {OTSCRawSeriesGroupBuilder} seriesBuilderSpec
 * @param {unknown} [elementOwner]
 * @param {Object<string, Utils.AtmWorkflow.ChartsDashboardEditor.Axis} axesMap
 * @param {Object<string, Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup} groupsMap
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
 */
function createSeriesModelFromSpec(
  seriesSpec,
  elementOwner = null,
  axesMap = {},
  groupsMap = {},
) {
  const series = Series.create({
    elementOwner,
  });
  let id;
  let name;
  let type;
  let yAxisId;
  let groupId;
  let color;
  const seriesTemplate = seriesSpec.builderRecipe?.seriesTemplate;
  if (seriesSpec.builderType === 'dynamic') {
    const externalSourceParameters = seriesSpec?.builderRecipe
      ?.dynamicSeriesConfigsSource?.sourceSpec?.externalSourceParameters;
    type = seriesTemplate?.typeProvider?.functionName === 'literal' ?
      seriesTemplate.typeProvider.functionArguments?.data : null;
    yAxisId = seriesTemplate?.yAxisIdProvider?.functionName === 'literal' ?
      seriesTemplate.yAxisIdProvider.functionArguments?.data : null;
    groupId = seriesTemplate?.groupIdProvider?.functionName === 'literal' ?
      seriesTemplate.groupIdProvider.functionArguments?.data : null;
    color = seriesTemplate?.colorProvider?.functionName === 'literal' ?
      seriesTemplate.colorProvider.functionArguments?.data : null;
    setProperties(series, {
      repeatPerPrefixedTimeSeries: true,
      prefixedTimeSeriesRef: externalSourceParameters ?
        EmberObject.create(externalSourceParameters) : null,
    });
  } else {
    id = seriesTemplate?.id;
    name = seriesTemplate?.name;
    type = seriesTemplate?.type;
    yAxisId = seriesTemplate?.yAxisId;
    groupId = seriesTemplate?.groupId;
    color = seriesTemplate?.color;
  }

  const axis = axesMap[yAxisId];
  const group = groupsMap[groupId];

  if (id) {
    set(series, 'id', id);
  }
  if (name) {
    set(series, 'name', name);
  }
  if (type) {
    set(series, 'type', type);
  }
  if (axis) {
    set(series, 'axis', axis);
  }
  if (group) {
    set(series, 'group', group);
  }
  if (color) {
    set(series, 'color', color);
  }

  return series;
}
