/**
 * Model of a single chart axis for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import generateId from 'onedata-gui-common/utils/generate-id';
import ElementBase from './element-base';
import { ElementType } from './common';
import functions from './functions-model';

/**
 * @typedef {DashboardElementValidationError} AxisNameEmptyValidationError
 * @property {'axisNameEmpty'} errorId
 */

/**
 * @typedef {DashboardElementValidationError} AxisMinIntervalInvalidValidationError
 * @property {'axisMinIntervalInvalid'} errorId
 */

const Axis = ElementBase.extend({
  /**
   * @override
   */
  elementType: ElementType.Axis,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  id: undefined,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  name: '',

  /**
   * @public
   * @virtual optional
   * @type {TimeSeriesStandardUnit | 'custom'}
   */
  unitName: 'none',

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<BytesUnitOptions | CustomUnitOptions> | null}
   */
  unitOptions: null,

  /**
   * Is a string, when user entered an invalid value
   * @public
   * @virtual optional
   * @type {number | string | null}
   */
  minInterval: null,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.FunctionsModel.AxisOutput}
   */
  valueProvider: undefined,

  /**
   * @public
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.FunctionsModel.FunctionBase>}
   */
  detachedFunctions: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.Series>}
   */
  series: undefined,

  /**
   * @private
   * @type {{ BytesUnitOptions?: BytesUnitOptions, CustomUnitOptions?: CustomUnitOptions }}
   */
  usedUnitOptions: undefined,

  /**
   * @override
   */
  referencingPropertyNames: Object.freeze([
    'series',
    'parent',
    'valueProvider',
    'detachedFunctions',
  ]),

  /**
   * @override
   */
  directValidationErrors: computed(
    'name',
    'minInterval',
    function directValidationErrors() {
      const errors = [];
      if (!this.name) {
        errors.push({
          element: this,
          errorId: 'axisNameEmpty',
        });
      }
      if (typeof this.minInterval === 'string') {
        errors.push({
          element: this,
          errorId: 'axisMinIntervalInvalid',
        });
      }
      return errors;
    }
  ),

  /**
   * @override
   */
  nestedValidationErrors: reads('labelFormattingValidationErrors'),

  /**
   * @type {ComputedProperty<Array<DashboardElementValidationError>>}
   */
  labelFormattingValidationErrors: computed(
    'valueProvider.validationErrors',
    'detachedFunctions.@each.validationErrors',
    function labelFormattingValidationErrors() {
      return _.flatten(
        [this.valueProvider, ...this.detachedFunctions]
        .map(({ validationErrors }) => validationErrors)
      );
    }
  ),

  unitOptionsConfigurator: observer(
    'unitName',
    'unitOptions',
    function unitOptionsConfigurator() {
      const unitOptionsType = getUnitOptionsTypeForUnitName(this.unitName);
      if (!unitOptionsType) {
        if (this.unitOptions) {
          this.set('unitOptions', null);
        }
        return;
      }

      let newUnitOptions = null;
      const currentUnitOptionsType = Object.keys(this.usedUnitOptions)
        .find((type) => this.usedUnitOptions[type] === this.unitOptions);

      if (
        !this.unitOptions ||
        (currentUnitOptionsType && currentUnitOptionsType !== unitOptionsType)
      ) {
        newUnitOptions = this.usedUnitOptions[unitOptionsType] ??
          createUnitOptions(unitOptionsType);
      } else {
        newUnitOptions = this.unitOptions;
      }
      this.usedUnitOptions[unitOptionsType] = newUnitOptions;
      if (this.unitOptions !== newUnitOptions) {
        this.set('unitOptions', newUnitOptions);
      }
    }
  ),

  /**
   * @override
   */
  init() {
    if (!this.id) {
      this.set('id', generateId());
    }
    if (!this.series) {
      this.set('series', []);
    }
    this.set('usedUnitOptions', {});
    if (!this.valueProvider) {
      const axisOutput = functions.axisOutput.modelClass.create({
        parent: this,
        elementOwner: this.elementOwner,
      });
      const currentValue = functions.currentValue.modelClass.create({
        parent: axisOutput,
        elementOwner: this.elementOwner,
      });
      set(axisOutput, 'data', currentValue);

      this.set('valueProvider', axisOutput);
    }
    if (!this.detachedFunctions) {
      this.set('detachedFunctions', []);
    }

    this._super(...arguments);
    this.unitOptionsConfigurator();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.unitOptions) {
        this.unitOptions.destroy();
        this.set('unitOptions', null);
      }
      if (this.series.length) {
        this.set('series', []);
      }
      if (this.valueProvider) {
        this.valueProvider.destroy();
        this.set('valueProvider', null);
      }
      if (this.detachedFunctions.length) {
        this.detachedFunctions.forEach((chartFunction) => chartFunction.destroy());
        this.set('detachedFunctions', []);
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
  clone(preserveReferences = false) {
    const axisClone = Axis.create({
      elementOwner: this.elementOwner,
      dataSources: this.dataSources,
      id: generateId(),
      name: this.name,
      unitName: this.unitName,
      unitOptions: this.unitOptions ?
        EmberObject.create(this.unitOptions) : this.unitOptions,
      minInterval: this.minInterval,
      valueProvider: this.valueProvider?.clone(preserveReferences),
      detachedFunctions: this.detachedFunctions
        .map((func) => func.clone(preserveReferences)),
      series: preserveReferences ? [...this.series] : [],
      parent: this.parent,
    });

    if (axisClone.valueProvider) {
      set(axisClone.valueProvider, 'parent', axisClone);
    }
    axisClone.detachedFunctions.forEach((func) =>
      set(func, 'parent', axisClone)
    );

    return axisClone;
  },

  /**
   * @override
   */
  toJson() {
    const unitOptionsType = getUnitOptionsTypeForUnitName(this.unitName);
    let unitOptions = null;
    if (this.unitOptions) {
      switch (unitOptionsType) {
        case 'BytesUnitOptions':
          unitOptions = {
            format: this.unitOptions.format,
          };
          break;
        case 'CustomUnitOptions':
          unitOptions = {
            customName: this.unitOptions.customName,
            useMetricSuffix: this.unitOptions.useMetricSuffix,
          };
      }
    }

    return {
      id: this.id,
      name: this.name,
      unitName: this.unitName,
      unitOptions,
      minInterval: this.minInterval,
      valueProvider: this.valueProvider.toJson(),
    };
  },

  /**
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    yield* this.series;
  },
});

export default Axis;

/**
 * @param {TimeSeriesStandardUnit | 'custom'} unitName
 * @returns {'BytesUnitOptions' | 'CustomUnitOptions' | null}
 */
export function getUnitOptionsTypeForUnitName(unitName) {
  switch (unitName) {
    case 'bytes':
    case 'bytesPerSec':
    case 'bits':
    case 'bitsPerSec':
      return 'BytesUnitOptions';
    case 'custom':
      return 'CustomUnitOptions';
    default:
      return null;
  }
}

/**
 *
 * @param {'BytesUnitOptions' | 'CustomUnitOptions'} unitOptionsType
 * @returns {EmberObject<BytesUnitOptions | CustomUnitOptions>}
 */
function createUnitOptions(unitOptionsType) {
  switch (unitOptionsType) {
    case 'BytesUnitOptions':
      return EmberObject.create({
        format: 'iec',
      });
    case 'CustomUnitOptions':
      return EmberObject.create({
        customName: '',
        useMetricSuffix: false,
      });
  }
}
