/**
 * Renders chart function - main block, argument blocks and lines between them.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, computed, observer, defineProperty } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { reads } from '@ember/object/computed';
import { not } from 'ember-awesome-macros';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import {
  getFunctionNameTranslation,
  getFunctionArgumentNameTranslation,
  ElementType,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import dom from 'onedata-gui-common/utils/dom';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor/function-renderer';

/**
 * @typedef {Object} FunctionRendererArgument
 * @property {string} readableName
 * @property {string} name
 * @property {Array<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase>} attachedFunctions
 * @property {boolean} isArray
 */

export default OneDraggableObject.extend({
  layout,
  classNames: ['function-renderer'],
  classNameBindings: ['chartFunction.isRoot:root-function'],
  attributeBindings: ['chartFunction.id:data-function-id'],

  i18n: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase}
   */
  chartFunction: undefined,

  /**
   * @virtual
   * @type {FunctionExecutionContext}
   */
  executionContext: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<Array<FunctionRendererArgument>>}
   */
  functionArguments: undefined,

  /**
   * Contains current parent chart function (if exists). Is not a computed - is
   * set `parentObserver`. That approach allows to analyse difference between old
   * and new parent values.
   * Is null, when element's parent is not a chart function.
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null}
   */
  parentChartFunction: null,

  /**
   * For one-draggable-object
   * @override
   */
  dragHandle: '.function-block-header',

  /**
   * @type {ComputedProperty<SafeString>}
   */
  readableName: computed('chartFunction.name', function readableName() {
    return getFunctionNameTranslation(this.i18n, this.chartFunction.name);
  }),

  /**
   * @type {ComputedProperty<string | null>}
   */
  settingsComponentName: computed(
    'chartFunction.{name.hasSettingsComponent}',
    function settingsComponentName() {
      if (!this.chartFunction.hasSettingsComponent) {
        return null;
      }

      return `atm-workflow/charts-dashboard-editor/function-editor/${dasherize(this.chartFunction.name)}-settings`;
    }
  ),

  /**
   * For one-draggable-object
   * @override
   */
  isDraggable: not('chartFunction.isRoot'),

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('chartFunction'),

  functionArgumentsSetter: observer(
    'chartFunction.attachableArgumentSpecs',
    function functionArgumentsSetter() {
      const propertiesToObserve = this.chartFunction.attachableArgumentSpecs
        .map(({ name }) => name);
      const computedObservedProps = propertiesToObserve.length ? [
        `chartFunction.{${propertiesToObserve.join(',')}}`,
      ] : [];

      defineProperty(
        this,
        'functionArguments',
        computed(...computedObservedProps, function functionArguments() {
          return this.chartFunction.attachableArgumentSpecs.map((argSpec) => {
            let attachedFunctions = this.chartFunction[argSpec.name];
            if (!argSpec.isArray) {
              attachedFunctions = attachedFunctions ? [attachedFunctions] : [];
            }
            return {
              readableName: getFunctionArgumentNameTranslation(
                this.i18n,
                this.chartFunction.name,
                argSpec.name
              ),
              name: argSpec.name,
              attachedFunctions,
              isArray: argSpec.isArray,
            };
          });
        })
      );
      this.functionArguments;
    }
  ),

  parentObserver: observer('chartFunction.parent', function parentObserver() {
    if (this.parentChartFunction === this.chartFunction.parent) {
      return;
    }
    const wasParentRemoved = this.parentChartFunction?.isRemoved ?? false;
    this.set(
      'parentChartFunction',
      this.chartFunction.parent?.elementType === ElementType.Function ?
      this.chartFunction.parent : null
    );

    if (!this.element) {
      return;
    }
    const isDetachedInDom =
      this.element.parentElement.matches('.detached-functions-container');
    const rootFunctionBlock = this.element.closest('.function-editor')
      ?.querySelector('.root-function > .function-block');
    const functionBlock = this.element.querySelector('.function-block');

    // Due to some unknown Ember issues `chartFunction.isDetached` does not always
    // recalculate on parent change (but only in Firefox). Enforcing recalculation.
    this.chartFunction.notifyPropertyChange('isDetached');

    // When function becomes detached -> persist its current coordinates
    // relative to the root function (as root function position is considered
    // constant).
    if (
      functionBlock &&
      rootFunctionBlock &&
      this.chartFunction.isDetached &&
      !isDetachedInDom
    ) {
      const position = dom.position(functionBlock, rootFunctionBlock);
      const detachPositionOffset = {
        top: 0,
        left: wasParentRemoved ? 0 : 100,
      };
      set(this.chartFunction, 'positionRelativeToRootFunc', {
        top: position.top + detachPositionOffset.top,
        left: position.left + detachPositionOffset.left,
      });
    }
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.parentObserver();
    this.functionArgumentsSetter();
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);

    (async () => {
      await waitForRender();
      if (this.element) {
        this.recalculateArgumentLinePositions();
      }
    })();
  },

  recalculateArgumentLinePositions() {
    const argumentElements = this.element.querySelectorAll(
      ':scope > .function-arguments-container > .function-argument');
    for (const argumentElement of argumentElements) {
      const startLineElement = argumentElement.querySelector(':scope > .argument-start-line');
      const startLineHeight = dom.height(startLineElement);
      const argumentBlockElements = argumentElement.querySelectorAll(
        ':scope > .function-argument-blocks > .function-argument-block'
      );
      for (const argumentBlockElement of argumentBlockElements) {
        const middleLineElement = argumentBlockElement.querySelector(':scope > .argument-middle-line');
        const endLineElement = argumentBlockElement.querySelector(':scope > .argument-end-line');
        // Distance below can be negative when end line is lower (on the Y axis) than start.
        const startToEndDistance = dom.position(endLineElement, startLineElement).top;

        let middleLineCSSVariables;
        if (Math.abs(startToEndDistance) <= startLineHeight) {
          middleLineCSSVariables = {
            '--argument-middle-line-length': '0px',
            '--argument-middle-line-top': `calc(50% - ${startLineHeight / 2}px)`,
            '--argument-middle-line-bottom': 'initial',
          };
        } else {
          middleLineCSSVariables = {
            '--argument-middle-line-length': `${Math.abs(startToEndDistance) + startLineHeight}px`,
            [`--argument-middle-line-${startToEndDistance > 0 ? 'bottom' : 'top'}`]: `calc(50% - ${startLineHeight / 2}px)`,
            [`--argument-middle-line-${startToEndDistance <= 0 ? 'bottom' : 'top'}`]: 'initial',
          };
        }

        Object.keys(middleLineCSSVariables).forEach((variable) =>
          middleLineElement.style.setProperty(variable, middleLineCSSVariables[variable])
        );
      }
    }
  },

  actions: {
    removeFunction() {
      const action = this.actionsFactory
        .createRemoveFunctionAction({ functionToRemove: this.chartFunction });
      action.execute();
    },
    detachFunction(func) {
      const action = this.actionsFactory
        .createDetachArgumentFunctionAction({ functionToDetach: func });
      action.execute();
    },
  },
});
