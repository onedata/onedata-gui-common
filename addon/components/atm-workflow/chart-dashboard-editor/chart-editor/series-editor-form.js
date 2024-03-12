/**
 * A form with all basic properties of a chart series.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { tag, eq, raw, and, not } from 'ember-awesome-macros';
import _ from 'lodash';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import ColorField from 'onedata-gui-common/utils/form-component/color-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { translateSeriesType } from 'onedata-gui-common/utils/time-series-dashboard';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/series-editor-form';
import {
  ElementType,
  getUnnamedElementNamePlaceholder,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import {
  TimeSeriesSelector,
  updateTimeSeriesSelectorFormValues,
} from 'onedata-gui-common/components/atm-workflow/chart-dashboard-editor/function-editor/load-series-settings';

const noneGroup = Object.freeze({});
const defaultSeriesColor = '#000000';

export default Component.extend(I18n, {
  layout,
  tagName: 'form',
  classNames: ['series-editor-form', 'form', 'form-horizontal', 'form-component'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.seriesEditorForm',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Series}
   */
  series: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {ComputedProperty<TimeSeriesRef>}
   */
  prefixedTimeSeriesRef: reads('series.prefixedTimeSeriesRef'),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  form: computed(function form() {
    return Form.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'series.{repeatPerPrefixedTimeSeries,name,type,color,axis,group,defaultDataSource}',
    'prefixedTimeSeriesRef.{collectionRef,timeSeriesNameGenerator,metricNames}',
    function formValuesUpdater() {
      const repeatPerPrefixedTimeSeries =
        this.series?.repeatPerPrefixedTimeSeries ?? false;
      if (
        this.form.valuesSource.repeatPerPrefixedTimeSeries !==
        repeatPerPrefixedTimeSeries
      ) {
        set(
          this.form.valuesSource,
          'repeatPerPrefixedTimeSeries',
          repeatPerPrefixedTimeSeries
        );
      }

      updateTimeSeriesSelectorFormValues(
        this.form.valuesSource.timeSeriesSelector,
        this.series?.prefixedTimeSeriesRef,
        this.series?.defaultDataSource
      );

      ['name', 'type', 'axis'].forEach((fieldName) => {
        const newValue = this.series?.[fieldName] ?? '';
        if (newValue !== this.form.valuesSource[fieldName]) {
          set(this.form.valuesSource, fieldName, newValue);
        }
      });

      const newColor = this.series?.color ?? null;
      if (!newColor && this.form.valuesSource.colorType !== 'auto') {
        set(this.form.valuesSource, 'colorType', 'auto');
      } else if (newColor) {
        if (this.form.valuesSource.colorType !== 'custom') {
          set(this.form.valuesSource, 'colorType', 'custom');
        }
        if (this.form.valuesSource.customColor !== newColor) {
          set(this.form.valuesSource, 'customColor', newColor);
        }
      }

      const newGroupValue = this.series?.group ?? noneGroup;
      if (newGroupValue !== this.form.valuesSource.group) {
        set(this.form.valuesSource, 'group', newGroupValue);
      }

      this.form.invalidFields.forEach((field) => field.markAsModified());
    }
  ),

  init() {
    this._super(...arguments);
    this.formValuesUpdater();
  },

  /**
   * @param {string} fieldName
   * @param {string} value
   * @returns {void}
   */
  onValueChange(fieldName, value) {
    if (!fieldName) {
      return;
    }

    let changeType;
    switch (fieldName) {
      case 'name':
        changeType = 'continuous';
        break;
      case 'repeatPerPrefixedTimeSeries':
      case 'type':
      case 'colorType':
      case 'customColor':
      case 'axis':
      case 'group':
      default:
        changeType = 'discrete';
        break;
    }

    let normalizedFieldName = fieldName;
    let normalizedValue = value;
    switch (fieldName) {
      case 'colorType':
        normalizedFieldName = 'color';
        normalizedValue = value === 'auto' ?
          null : (this.series.color ?? defaultSeriesColor);
        break;
      case 'customColor':
        normalizedFieldName = 'color';
        break;
      case 'collectionRef':
      case 'timeSeriesNameGenerator':
      case 'metricNames':
        normalizedFieldName = `prefixedTimeSeriesRef.${fieldName}`;
        break;
      case 'timeSeriesName':
        // Its should never happend as `timeSeriesName` field is not rendered in
        // time series selector. But for sake of security, we throw this field
        // change away.
        return;
    }

    if (normalizedValue === noneGroup) {
      normalizedValue = null;
    }

    const action = this.editorContext.actionsFactory.createChangeElementPropertyAction({
      element: this.series,
      propertyName: normalizedFieldName,
      newValue: normalizedValue,
      changeType,
    });

    if (normalizedFieldName === 'axis' || normalizedFieldName === 'group') {
      // This hook is responsible for adding/removing this series from
      // axis/group. Changing axis/group property in series is not enough - we
      // have to update also series references list of axis/group itself.
      action.addExecuteHook((actionResult) => {
        const addSeriesTo = actionResult.undo ?
          action.previousValue : normalizedValue;
        const removeSeriesFrom = actionResult.undo ?
          normalizedValue : action.previousValue;
        if (addSeriesTo) {
          set(addSeriesTo, 'series', [...addSeriesTo.series, this.series]);
        }
        if (removeSeriesFrom) {
          set(
            removeSeriesFrom,
            'series',
            removeSeriesFrom.series.filter((series) => series !== this.series)
          );
        }
      });
    }

    action.execute();
  },

  /**
   * @returns {void}
   */
  onEditionInterrupted() {
    this.editorContext.actionsFactory?.interruptActiveChangeElementPropertyAction();
  },
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const RepeatPerPrefixedTimeSeriesField = ToggleField.extend({
  name: 'repeatPerPrefixedTimeSeries',
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const NameField = TextField.extend({
  name: 'name',
  isVisible: not('valuesSource.repeatPerPrefixedTimeSeries'),
});

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const TypeField = DropdownField.extend({
  name: 'type',
  showSearch: false,
  options: computed(function options() {
    return ['line', 'bar'].map((type) => ({
      value: type,
      label: translateSeriesType(this.i18n, type),
    }));
  }),
});

/**
 * @type {Utils.FormComponent.RadioField}
 */
const ColorTypeField = RadioField.extend({
  name: 'colorType',
  options: Object.freeze([{ value: 'auto' }, { value: 'custom' }]),
  isVisible: not('valuesSource.repeatPerPrefixedTimeSeries'),
});

const CustomColorField = ColorField.extend({
  name: 'customColor',
  defaultValue: defaultSeriesColor,
  isVisible: and(
    not('valuesSource.repeatPerPrefixedTimeSeries'),
    eq('valuesSource.colorType', raw('custom'))
  ),
});

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const AxisField = DropdownField.extend({
  name: 'axis',
  options: computed('parent.chart.axes.@each.name', function options() {
    return this.parent.chart?.axes.map((axis) => ({
      value: axis,
      label: normalizeName(this.i18n, axis.name),
    })) ?? [];
  }),
});

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const GroupField = DropdownField.extend({
  name: 'group',
  options: computed('parent.chart.deepSeriesGroups.@each.name', function options() {
    const groupOptions = this.parent.chart?.deepSeriesGroups.map((group) => {
      const parentGroups = [];
      let parent = group.parent;
      while (parent.elementType === ElementType.SeriesGroup) {
        parentGroups.unshift(parent);
        parent = parent.parent;
      }

      let path = parentGroups.length ?
        normalizeName(this.i18n, parentGroups[0].name) : '';
      parentGroups.slice(1).forEach((parentGroup) =>
        path += ` &gt; ${normalizeName(this.i18n, parentGroup.name)}`
      );
      const pathTranslation = path ? htmlSafe(
        ` <small class="text-muted">${this.getTranslation('pathInfo', { path: htmlSafe(path) })}`
      ) : '';

      return {
        value: group,
        label: htmlSafe(`${_.escape(group.name)}${pathTranslation}`),
      };
    }) ?? [];

    return [{
      value: noneGroup,
      label: htmlSafe(`<em>${this.getTranslation('options.none.label')}</em>`),
    }, ...groupOptions];
  }),
});

/**
 * @type {Utils.FormComponent.FormFieldsGroup}
 */
const PrefixedTimeSeriesSelector = TimeSeriesSelector.extend({
  /**
   * @override
   */
  allowPrefixedTimeSeriesOnly: true,

  /**
   * @override
   */
  classes: 'prefixed-time-series-selector-group',

  /**
   * @override
   */
  addColonToLabel: false,

  /**
   * @override
   */
  label: computed(function label() {
    return this.parent.getTranslation('timeSeriesSelector.label');
  }),

  /**
   * @override
   */
  isVisible: reads('valuesSource.repeatPerPrefixedTimeSeries'),
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const Form = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartDashboardEditor.ChartEditor.SeriesEditorForm}
   */
  component: undefined,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  i18nPrefix: tag `${'component.i18nPrefix'}.fields`,

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  isEnabled: not('component.editorContext.isReadOnly'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartDashboardEditor.Chart>}
   */
  chart: reads('component.chart'),

  /**
   * @type {ComputedProperty<Array<ChartDashboardEditorDataSource>>}
   */
  dataSources: reads('component.series.dataSources'),

  /**
   * @override
   */
  fields: computed(() => [
    RepeatPerPrefixedTimeSeriesField.create(),
    PrefixedTimeSeriesSelector.create(),
    NameField.create(),
    TypeField.create(),
    ColorTypeField.create(),
    CustomColorField.create(),
    AxisField.create(),
    GroupField.create(),
  ]),

  /**
   * @override
   */
  onValueChange(value, field) {
    this._super(...arguments);
    this.component.onValueChange(field.name, value);
  },

  /**
   * @override
   */
  onFocusLost() {
    this._super(...arguments);
    this.component.onEditionInterrupted();
  },
});

/**
 * @param {Ember.Service} i18n
 * @param {string} name
 * @returns {string}
 */
function normalizeName(i18n, name) {
  if (!name) {
    return `<em>${getUnnamedElementNamePlaceholder(i18n)}</em>`;
  } else {
    return _.escape(name);
  }
}
