import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { tag, eq, raw } from 'ember-awesome-macros';
import _ from 'lodash';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import ColorField from 'onedata-gui-common/utils/form-component/color-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { translateSeriesType } from 'onedata-gui-common/utils/time-series-dashboard';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-editor-form';
import {
  ElementType,
  getUnnamedElementNamePlaceholder,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

// TODO: VFS-10649 Handle dynamic series names

const noneGroup = Object.freeze({});

export default Component.extend(I18n, {
  layout,
  tagName: 'form',
  classNames: ['series-editor-form', 'form', 'form-horizontal', 'form-component'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesEditorForm',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Series}
   */
  series: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  form: computed(function form() {
    return Form.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'series.{name,type,color,axis,group}',
    function formValuesUpdater() {
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
    if (fieldName === 'colorType') {
      normalizedFieldName = 'color';
      normalizedValue = value === 'auto' ? null : (this.series.color ?? '#000000');
    } else if (fieldName === 'customColor') {
      normalizedFieldName = 'color';
    } else if (normalizedValue === noneGroup) {
      normalizedValue = null;
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.series,
      propertyName: normalizedFieldName,
      newValue: normalizedValue,
      changeType,
    });
    action.execute();
  },

  /**
   * @returns {void}
   */
  onEditionInterrupted() {
    this.actionsFactory?.interruptActiveChangeElementPropertyAction();
  },
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const NameField = TextField.extend({
  name: 'name',
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
});

const CustomColorField = ColorField.extend({
  name: 'customColor',
  defaultValue: '#000000',
  isVisible: eq('valuesSource.colorType', raw('custom')),
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

const Form = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartsDashboardEditor.ChartEditor.SeriesEditorForm}
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
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Chart>}
   */
  chart: reads('component.chart'),

  /**
   * @override
   */
  fields: computed(() => [
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
