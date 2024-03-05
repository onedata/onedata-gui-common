/**
 * A set of functions which are responsible for creating editor model (from
 * given spec or from scratch).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set } from '@ember/object';
import generateId from 'onedata-gui-common/utils/generate-id';
import Model from './model';
import Section from './section';
import Chart from './chart';
import Axis, { getUnitOptionsTypeForUnitName } from './axis';
import SeriesGroup from './series-group';
import Series from './series';
import { functions } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { ChartNavigation } from 'onedata-gui-common/utils/time-series-dashboard';

/**
 * @type {string}
 */
const i18nPrefix = 'utils.atmWorkflow.chartsDashboardEditor.createModel';

/**
 * Converts raw charts dashboard spec into a model used by dashboard editor.
 * @param {AtmTimeSeriesDashboardSpec | null} dashboardSpec
 * @param {unknown} elementsOwner
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Model}
 */
export function createModelFromSpec(dashboardSpec, elementsOwner, dataSources) {
  const rootSection = dashboardSpec?.rootSection ?
    createSectionModelFromSpec(
      dashboardSpec.rootSection,
      elementsOwner,
      true,
      dataSources
    ) : null;

  return Model.create({
    elementsOwner,
    dataSources: dataSources ?? [],
    rootSection,
  });
}

/**
 * Generates and assigns new content for existing dashboard model using passed spec.
 * @param {AtmTimeSeriesDashboardSpec | null} newDashboardSpec
 * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Model} dashboardModel
 */
export function useNewSpecInModel(newDashboardSpec, dashboardModel) {
  const newRootSection = newDashboardSpec?.rootSection ?
    createSectionModelFromSpec(
      newDashboardSpec.rootSection,
      dashboardModel.elementsOwner,
      true,
      dashboardModel.dataSources
    ) : null;
  const oldRootSection = dashboardModel.rootSection;
  set(dashboardModel, 'rootSection', newRootSection);
  oldRootSection?.destroy();
}

/**
 * Returns new, empty section.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @param {boolean} [isRoot]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
export function createNewSection(
  i18n,
  elementOwner = null,
  isRoot = false,
) {
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
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
export function createNewChart(i18n, elementOwner = null, dataSources = []) {
  return createChartModelFromSpec({
    title: {
      content: String(i18n.t(`${i18nPrefix}.newChart.title`)),
    },
    yAxes: [{
      id: generateId(),
      name: String(i18n.t(`${i18nPrefix}.newAxis.name`)),
    }],
  }, elementOwner, dataSources);
}

/**
 * Returns new, empty axis.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
 */
export function createNewAxis(i18n, elementOwner = null, dataSources = []) {
  return createAxisModelFromSpec({
    id: generateId(),
    name: String(i18n.t(`${i18nPrefix}.newAxis.name`)),
  }, elementOwner, dataSources);
}

/**
 * Returns new, empty series group.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
 */
export function createNewSeriesGroup(i18n, elementOwner = null, dataSources = []) {
  return createSeriesGroupModelFromSpec({
    id: generateId(),
    name: String(i18n.t(`${i18nPrefix}.newSeriesGroup.name`)),
  }, elementOwner, dataSources);
}

/**
 * Returns new, empty series.
 * @param {Ember.Service} i18n
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
 */
export function createNewSeries(i18n, elementOwner = null, dataSources = []) {
  return createSeriesModelFromSpec({
    builderType: 'static',
    builderRecipe: {
      seriesTemplate: {
        id: generateId(),
        name: String(i18n.t(`${i18nPrefix}.newSeries.name`)),
      },
    },
  }, elementOwner, dataSources);
}

/**
 * Returns new function.
 * @param {string} functionName
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionModels.FunctionBase}
 */
export function createNewFunction(functionName, elementOwner = null, dataSources = []) {
  const functionElemSpec = functions[functionName];
  return functionElemSpec.modelClass.create({ elementOwner, dataSources });
}

/**
 * @param {Partial<OneTimeSeriesChartsSectionSpec>} sectionSpec
 * @param {unknown} [elementOwner]
 * @param {boolean} [isRoot]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
 */
export function createSectionModelFromSpec(
  sectionSpec,
  elementOwner = null,
  isRoot = false,
  dataSources = []
) {
  const section = Section.create({
    elementOwner,
    isRoot,
    dataSources,
    title: sectionSpec.title?.content ?? '',
    titleTip: sectionSpec.title?.tip ?? '',
    description: sectionSpec.description ?? '',
    chartNavigation: sectionSpec.chartNavigation ?? ChartNavigation.Independent,
    charts: sectionSpec.charts
      ?.filter(Boolean)
      .map((chartSpec) =>
        createChartModelFromSpec(chartSpec, elementOwner, dataSources)
      ) ?? [],
    sections: sectionSpec.sections
      ?.filter(Boolean)
      .map((subsectionSpec) =>
        createSectionModelFromSpec(subsectionSpec, elementOwner, false, dataSources)
      ) ?? [],
  });
  section.charts.forEach((chart) => set(chart, 'parent', section));
  section.sections.forEach((subsection) => set(subsection, 'parent', section));
  return section;
}

/**
 * @param {Partial<OTSCChartDefinition>} chartSpec
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
 */
export function createChartModelFromSpec(
  chartSpec,
  elementOwner = null,
  dataSources = []
) {
  const chart = Chart.create({
    elementOwner,
    dataSources,
    title: chartSpec.title?.content ?? '',
    titleTip: chartSpec.title?.tip ?? '',
    axes: chartSpec.yAxes
      ?.filter(Boolean)
      .map((axisSpec) =>
        createAxisModelFromSpec(axisSpec, elementOwner, dataSources)
      ) ?? [],
    seriesGroups: chartSpec.seriesGroupBuilders
      ?.filter((builder) =>
        builder?.builderType === 'static' &&
        builder.builderRecipe?.seriesGroupTemplate
      )
      .map((builder) => createSeriesGroupModelFromSpec(
        builder.builderRecipe.seriesGroupTemplate,
        elementOwner,
        dataSources
      )) ?? [],
  });
  const axesMap = {};
  const groupsMap = {};
  chart.axes.forEach((axis) => {
    axesMap[axis.id] = axis;
    set(axis, 'parent', chart);
  });
  chart.seriesGroups.forEach((seriesGroup) => {
    set(seriesGroup, 'parent', chart);
  });
  chart.deepSeriesGroups.forEach((seriesGroup) => {
    groupsMap[seriesGroup.id] = seriesGroup;
  });

  set(
    chart,
    'series',
    chartSpec.seriesBuilders
    ?.filter(Boolean)
    .map((seriesSpec) =>
      createSeriesModelFromSpec(seriesSpec, elementOwner, dataSources, axesMap, groupsMap)
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
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
 */
function createAxisModelFromSpec(axisSpec, elementOwner = null, dataSources = []) {
  const unitOptionsType = getUnitOptionsTypeForUnitName(axisSpec.unitName);
  let unitOptions = null;
  if (unitOptionsType === 'BytesUnitOptions') {
    unitOptions = EmberObject.create({
      format: axisSpec.unitOptions?.format ?? 'iec',
    });
  } else if (unitOptionsType === 'CustomUnitOptions') {
    unitOptions = EmberObject.create({
      customName: axisSpec.unitOptions?.customName ?? '',
      useMetricSuffix: axisSpec.unitOptions?.useMetricSuffix ?? false,
    });
  }

  const axisOutputFunc = functions.axisOutput.modelClass.create({
    elementOwner,
    dataSources,
  });
  let valueProviderFunction;
  if (axisSpec.valueProvider) {
    valueProviderFunction =
      createFunctionFromSpec(axisSpec.valueProvider, elementOwner, dataSources);
  } else {
    valueProviderFunction = functions.currentValue.modelClass.create({
      elementOwner,
      dataSources,
    });
  }
  set(valueProviderFunction, 'parent', axisOutputFunc);
  set(axisOutputFunc, 'data', valueProviderFunction);

  const axis = Axis.create({
    elementOwner,
    dataSources,
    id: axisSpec.id,
    name: axisSpec.name,
    unitName: axisSpec.unitName ?? 'none',
    unitOptions,
    minInterval: axisSpec.minInterval ?? null,
    // We use axisOutput function as a proxy between axis and its real
    // function from valueProvider field. It simplifies rendering.
    valueProvider: axisOutputFunc,
  });
  set(axisOutputFunc, 'parent', axis);

  return axis;
}

/**
 * @param {Partial<OTSCRawSeriesGroup>} seriesGroupSpec
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
 */
function createSeriesGroupModelFromSpec(
  seriesGroupSpec,
  elementOwner = null,
  dataSources = []
) {
  const seriesGroup = SeriesGroup.create({
    elementOwner,
    dataSources,
    id: seriesGroupSpec.id,
    name: seriesGroupSpec.name,
    stacked: Boolean(seriesGroupSpec.stacked),
    showSum: Boolean(seriesGroupSpec.showSum),
    seriesGroups: seriesGroupSpec.subgroups
      ?.filter(Boolean)
      .map((subgroupSpec) =>
        createSeriesGroupModelFromSpec(subgroupSpec, elementOwner, dataSources)
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
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @param {Object<string, Utils.AtmWorkflow.ChartsDashboardEditor.Axis} [axesMap]
 * @param {Object<string, Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup} [groupsMap]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
 */
function createSeriesModelFromSpec(
  seriesSpec,
  elementOwner = null,
  dataSources = [],
  axesMap = {},
  groupsMap = {},
) {
  const series = Series.create({
    elementOwner,
    dataSources,
    repeatPerPrefixedTimeSeries: seriesSpec.builderType === 'dynamic',
  });
  let id;
  let name;
  let type;
  let yAxisId;
  let groupId;
  let color;
  let prefixedTimeSeriesRef;
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
    if (externalSourceParameters) {
      prefixedTimeSeriesRef = EmberObject.create(externalSourceParameters);
      if (!prefixedTimeSeriesRef.collectionRef) {
        let defaultDataSource = null;
        const defaultDataSources =
          dataSources?.filter(({ isDefault }) => isDefault);
        if (defaultDataSources?.length === 1) {
          defaultDataSource = defaultDataSources[0];
        }

        if (defaultDataSource) {
          set(prefixedTimeSeriesRef, 'collectionRef', defaultDataSource.collectionRef);
        }
      }
    }
  } else {
    id = seriesTemplate?.id;
    name = seriesTemplate?.name;
    type = seriesTemplate?.type;
    yAxisId = seriesTemplate?.yAxisId;
    groupId = seriesTemplate?.groupId;
    color = seriesTemplate?.color;
  }
  const dataProvider = seriesTemplate?.dataProvider;

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
  if (prefixedTimeSeriesRef) {
    set(series, 'prefixedTimeSeriesRef', prefixedTimeSeriesRef);
  }
  const seriesOutputFunc = functions.seriesOutput.modelClass.create({
    elementOwner,
    dataSources,
    parent: series,
  });
  if (dataProvider) {
    const dataProviderFunction =
      createFunctionFromSpec(dataProvider, elementOwner, dataSources);
    set(dataProviderFunction, 'parent', seriesOutputFunc);
    set(seriesOutputFunc, 'data', dataProviderFunction);
  }
  // We use seriesOutput function as a proxy between series and its real
  // function from dataProvider field. It simplifies rendering.
  set(series, 'dataProvider', seriesOutputFunc);

  set(series, 'dataSources', dataSources);

  return series;
}

/**
 * @param {unknown} functionSpec
 * @param {unknown} [elementOwner]
 * @param {Array<ChartsDashboardEditorDataSource>} [dataSources]
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.FunctionBase}
 */
export function createFunctionFromSpec(
  functionSpec,
  elementOwner = null,
  dataSources = []
) {
  let functionName = functionSpec?.functionName;
  if (
    functionName === 'loadSeries' &&
    functionSpec.functionArguments?.sourceSpecProvider.functionName ===
    'getDynamicSeriesConfig'
  ) {
    functionName = 'loadRepeatedSeries';
  }
  const functionElemSpec = functions[functionName];
  const functionProps = { elementOwner, dataSources };
  const convertAnySpecToFunction = (nestedFuncSpec) => {
    if (!nestedFuncSpec) {
      return null;
    }

    return createFunctionFromSpec(nestedFuncSpec, elementOwner, dataSources);
  };
  return functionElemSpec?.createFromSpec(
    functionSpec,
    functionProps,
    convertAnySpecToFunction
  ) ?? null;
}
