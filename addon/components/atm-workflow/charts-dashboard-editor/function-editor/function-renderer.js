/**
 * Renders chart function - main block, argument blocks and lines between them.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set, computed, observer, defineProperty } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { reads } from '@ember/object/computed';
import { not, and } from 'ember-awesome-macros';
import OneDraggableObject from 'onedata-gui-common/components/one-draggable-object';
import {
  getFunctionNameTranslation,
  getFunctionArgumentNameTranslation,
  ElementType,
  translateValidationErrorsBatch,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import dom from 'onedata-gui-common/utils/dom';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor/function-renderer';

/**
 * @typedef {Object} FunctionRendererArgument
 * @property {string} readableName
 * @property {string} name
 * @property {Array<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase>} attachedFunctions
 * @property {boolean} isArray
 * @property {boolean} hasFunctionAdder
 */

export default OneDraggableObject.extend(I18n, {
  layout,
  classNames: ['function-renderer'],
  classNameBindings: ['chartFunction.isRoot:root-function', 'editorContext.isReadOnly:read-only'],
  attributeBindings: ['chartFunction.id:data-function-id'],

  i18n: service(),
  dragDrop: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.functionEditor.functionRenderer',

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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {ComputedProperty<Array<FunctionRendererArgument>>}
   */
  functionArguments: undefined,

  /**
   * Contains current parent chart function (if exists). Is not a computed - it is
   * set `parentObserver`. That approach allows to analyse difference between old
   * and new parent values.
   * It is null, when element's parent is not a chart function.
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null}
   */
  parentChartFunction: null,

  /**
   * For one-draggable-object
   * @override
   */
  dragHandle: '.function-block-header',

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  functionOnlyValidationErrorsMessage: computed(
    'chartFunction.directValidationErrors',
    function functionOnlyValidationErrorsMessage() {
      const functionOnlyValidationErrors = this.chartFunction.directValidationErrors
        .filter(({ errorDetails }) =>
          !errorDetails?.relatedAttachedArgumentFunction
        );
      return translateValidationErrorsBatch(
        this.i18n,
        functionOnlyValidationErrors,
      );
    }
  ),

  /**
   * Maps argument function id -> translation of errors regarding assignment
   * of that function to our argument slot. If for some function there are no
   * errors, then it will not be present in the map.
   * @type {ComputedProperty<Object<string, SafeString>>}
   */
  perArgumentValidationErrorsMessages: computed(
    'chartFunction.directValidationErrors',
    function perArgumentValidationErrorsMessages() {
      const errorsPerArgument = {};
      for (const validationError of this.chartFunction.directValidationErrors) {
        const argumentFunctionId = validationError.errorDetails
          ?.relatedAttachedArgumentFunction?.id;
        if (argumentFunctionId) {
          if (!errorsPerArgument[argumentFunctionId]) {
            errorsPerArgument[argumentFunctionId] = [];
          }
          errorsPerArgument[argumentFunctionId].push(validationError);
        }
      }
      return Object.keys(errorsPerArgument).reduce((acc, funcId) => {
        acc[funcId] = translateValidationErrorsBatch(
          this.i18n,
          errorsPerArgument[funcId],
        );
        return acc;
      }, {});
    }
  ),

  /**
   * Contains open state of adder popovers. Each argument can have multiple adders
   * - one before each attached function and one at the end to create new argument.
   * Because of that Ember object for containing open state has format:
   * EmberObject({ [argumentName]: EmberObject({ [indexOfAttachedFunction]: boolean})).
   * Adder which adds new function at the end has index -1.
   * @type {ComputedProperty<EmberObject>}
   */
  adderOpenState: computed('chartFunction', function adderOpenState() {
    const argumentNames =
      this.chartFunction?.attachableArgumentSpecs.map(({ name }) => name) ?? [];
    const openState = EmberObject.create();
    argumentNames.forEach((argName) => set(openState, argName, EmberObject.create({
      '-1': false,
    })));
    return openState;
  }),

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
  isDraggable: and(not('editorContext.isReadOnly'), not('chartFunction.isRoot')),

  /**
   * For one-draggable-object
   * @override
   */
  content: reads('chartFunction'),

  /**
   * @type {ComputedProperties<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null>}
   */
  draggedChartFunction: computed(
    'dragDrop.draggedElementModel',
    function draggedChartFunction() {
      return this.dragDrop.draggedElementModel?.elementType === ElementType.Function ?
        this.dragDrop.draggedElementModel : null;
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInDraggedChartFunction: computed(
    'draggedChartFunction',
    function isInDraggedChartFunction() {
      return this.draggedChartFunction ? [
        ...this.draggedChartFunction.nestedElements(),
        this.draggedChartFunction,
      ].includes(this.chartFunction) : false;
    }
  ),

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
              hasFunctionAdder: argSpec.isArray || !attachedFunctions.length,
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
        this.recalculateDragTargetHeights();
      }
    })();
  },
  /**
   * @returns {void}
   */
  recalculateArgumentLinePositions() {
    const argumentElements = this.element.querySelectorAll(
      ':scope > .function-arguments-container > .function-argument');
    for (const argumentElement of argumentElements) {
      const startLineElement =
        argumentElement.querySelector(':scope > .argument-start-line');
      const startLineHeight = dom.height(startLineElement);
      const argumentBlockElements = argumentElement.querySelectorAll(
        ':scope > .function-argument-blocks > .function-argument-block'
      );
      for (const argumentBlockElement of argumentBlockElements) {
        const middleLineElement =
          argumentBlockElement.querySelector(':scope > .argument-middle-line');
        const endLineElement =
          argumentBlockElement.querySelector(':scope > .argument-end-line');
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

  /**
   * @returns {void}
   */
  recalculateDragTargetHeights() {
    const argumentElements = this.element.querySelectorAll(
      ':scope > .function-arguments-container > .function-argument'
    );

    for (const argumentElement of argumentElements) {
      const argumentBlocksChildren = argumentElement.querySelectorAll(
        ':scope > .function-argument-blocks > *'
      );
      const isFirstChildADropTarget = argumentBlocksChildren[0]?.matches(
        '.between-args-drop-target-container.before-first-arg'
      );
      const isSecondChildAFuncArgBlock = argumentBlocksChildren[1]?.matches(
        '.function-argument-block'
      );

      if (isFirstChildADropTarget && isSecondChildAFuncArgBlock) {
        const funcBlock = argumentBlocksChildren[1].querySelector(
          '.function-block, .adder-draggable-object-target'
        );
        const topEmptySpace = (
          dom.height(argumentBlocksChildren[1]) -
          dom.height(funcBlock)
        ) / 2;
        argumentBlocksChildren[0].style.setProperty('--y-offset', `${topEmptySpace}px`);
        argumentBlocksChildren[0].style.setProperty(
          '--min-sibling-block-width',
          `${dom.width(funcBlock)}px`
        );
      }

      for (let i = 1; i < argumentBlocksChildren.length; i++) {
        if (
          !argumentBlocksChildren[i].matches('.between-args-drop-target-container') ||
          !argumentBlocksChildren[i - 1].matches('.function-argument-block') ||
          !argumentBlocksChildren[i + 1]?.matches('.function-argument-block')
        ) {
          continue;
        }

        const topBlock = argumentBlocksChildren[i - 1].querySelector('.function-block');
        const bottomBlock = argumentBlocksChildren[i + 1].querySelector(
          '.function-block, .adder-draggable-object-target'
        );
        const topEmptySpace = (dom.height(argumentBlocksChildren[i - 1]) -
          dom.height(topBlock)) / 2;
        const bottomEmptySpace = (dom.height(argumentBlocksChildren[i + 1]) -
          dom.height(bottomBlock)) / 2;
        const minBlockWidth = Math.min(
          dom.width(topBlock),
          bottomBlock.matches('.function-block') ?
          dom.width(bottomBlock) : Number.POSITIVE_INFINITY
        );
        argumentBlocksChildren[i].style.setProperty('--y-offset', `-${topEmptySpace}px`);
        argumentBlocksChildren[i].style.setProperty(
          '--available-y-space',
          `${topEmptySpace + bottomEmptySpace}px`
        );
        argumentBlocksChildren[i].style.setProperty(
          '--min-sibling-block-width',
          `${minBlockWidth}px`
        );
      }
    }
  },

  /**
   * Returns trigger selector for function adder popover placed on
   * function-function relation line.
   * @param {string} argumentName
   * @param {number} indexInArgument
   * @returns {string}
   */
  getInChainFunctionAdderTriggerSelector(argumentName, indexInArgument) {
    return `#${this.elementId} [data-parent-function-id="${this.chartFunction.id}"][data-argument-name="${argumentName}"][data-argument-block-idx="${indexInArgument}"] > .argument-end-line .add-action`;
  },

  actions: {
    toggleAdder(argumentName, index, newState) {
      const normalizedNewState = typeof newState === 'boolean' ?
        newState : !this.adderOpenState[argumentName][index];
      set(this.adderOpenState[argumentName], index, normalizedNewState);
    },
    removeFunction() {
      const action = this.editorContext.actionsFactory
        .createRemoveFunctionAction({ functionToRemove: this.chartFunction });
      action.execute();
    },
    detachFunction(chartFunctionToDetach) {
      const action = this.editorContext.actionsFactory
        .createDetachArgumentFunctionAction({ functionToDetach: chartFunctionToDetach });
      action.execute();
    },
    validateOnAdderDragEvent() {
      return !this.editorContext.isReadOnly &&
        !this.isInDraggedChartFunction &&
        ![...this.chartFunction.attachedFunctions()]
        .includes(this.draggedChartFunction);
    },
    /**
     * @param {string} argumentName
     * @param {MoveElementActionNewPosition['placement'] | null} placement
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null} referenceFunction
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase} draggedFunction
     */
    acceptDraggedFunction(argumentName, placement, referenceFunction, draggedFunction) {
      let currentRelationFieldName;
      if (draggedFunction.isDetached) {
        currentRelationFieldName = 'detachedFunctions';
      } else {
        currentRelationFieldName =
          draggedFunction.parent?.getArgumentNameForAttachedFunction?.(draggedFunction);
      }

      if (!currentRelationFieldName) {
        return;
      }

      const action = this.editorContext.actionsFactory.createMoveElementAction({
        movedElement: draggedFunction,
        currentRelationFieldName,
        newParent: this.chartFunction,
        newRelationFieldName: argumentName,
        newPosition: placement ? {
          placement,
          referenceElement: referenceFunction,
        } : null,
      });
      action.execute();
    },
  },
});
