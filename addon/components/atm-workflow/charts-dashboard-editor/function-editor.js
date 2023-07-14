/**
 * An editor component for series/axes functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { eq, raw } from 'ember-awesome-macros';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import dom from 'onedata-gui-common/utils/dom';
import { ElementType, EdgeScroller } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor';

export default Component.extend({
  layout,
  classNames: ['function-editor'],
  classNameBindings: ['isFunctionDragged:has-dragging-function'],

  dragDrop: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase}
   */
  outputFunction: undefined,

  /**
   * @virtual
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase>}
   */
  detachedFunctions: undefined,

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
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EdgeScroller}
   */
  edgeScroller: undefined,

  /**
   * @type {ResizeObserver | null}
   */
  scrollableContainerResizeObserver: null,

  /**
   * @type {PerfectScrollbarApi | null}
   */
  scrollbarApi: null,

  /**
   * @type {ComputedProperty<boolean>}
   */
  isFunctionDragged: eq('dragDrop.draggedElementModel.elementType', raw(ElementType.Function)),

  edgeScrollerEnabler: observer(
    'isFunctionDragged',
    async function edgeScrollerEnabler() {
      if (this.isFunctionDragged) {
        this.edgeScroller?.enable();
      } else {
        await this.dragDrop.latestDragPromise;
        this.edgeScroller?.disable();
        this.resetDragDropExtraMargin();
      }
    }
  ),

  detachedFunctionPositionsObserver: observer(
    'detachedFunctions.@each.positionRelativeToRootFunc',
    function detachedFunctionPositionsObserver() {
      this.recalculateDetachedFunctionPositions();
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.edgeScrollerEnabler();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    const scrollableContainer = this.getScrollableContainer();
    if (scrollableContainer) {
      this.set('edgeScroller', new EdgeScroller(scrollableContainer));
      this.edgeScroller.addScrollEventListener((event) =>
        this.handleEdgeScrollerScroll(event)
      );
    }
    this.setupScrollableContainerResizeObserver();
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);

    (async () => {
      await waitForRender();
      if (this.element) {
        this.recalculateDetachedFunctionPositions();
      }
    })();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.edgeScroller?.destroy();
      this.set('edgeScroller', undefined);
      this.teardownScrollableContainerResizeObserver();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Resize observer is responsible for triggering recalculation of functions
   * container size.
   * @returns {void}
   */
  setupScrollableContainerResizeObserver() {
    if (this.resizeObserver) {
      return;
    }

    const scrollableContainer = this.getScrollableContainer();
    // Check whether ResizeObserver API is available
    if (!ResizeObserver || !scrollableContainer) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      this.recalculateWorkspaceSize();
    });
    resizeObserver.observe(scrollableContainer);

    this.set('scrollableContainerResizeObserver', resizeObserver);
  },

  /**
   * @returns {void}
   */
  teardownScrollableContainerResizeObserver() {
    this.scrollableContainerResizeObserver?.disconnect();
    this.set('scrollableContainerResizeObserver', null);
  },

  /**
   * @returns {void}
   */
  recalculateWorkspaceSize() {
    const scrollableContainer = this.getScrollableContainer();
    if (!scrollableContainer) {
      return;
    }

    const workspaceWidth = dom.width(
      scrollableContainer,
      dom.LayoutBox.PaddingBox
    );
    const workspaceHeight = dom.height(
      scrollableContainer,
      dom.LayoutBox.PaddingBox
    );
    scrollableContainer.style.setProperty('--workspace-width', `${workspaceWidth}px`);
    scrollableContainer.style.setProperty('--workspace-height', `${workspaceHeight}px`);
  },

  /**
   * @returns {void}
   */
  recalculateDetachedFunctionPositions() {
    const rootFunctionBlock = this.element?.querySelector(
      '.root-function > .function-block'
    );
    const detachedFunctionRenderers = this.element?.querySelectorAll(
      '.detached-functions-container > .function-renderer'
    );

    if (rootFunctionBlock && detachedFunctionRenderers?.length) {
      const rootFunctionBlockPosition = dom.position(
        rootFunctionBlock,
        rootFunctionBlock.closest('.functions-container')
      );

      [...detachedFunctionRenderers].forEach((detachedFunctionRenderer) => {
        const detachedFunctionId = detachedFunctionRenderer.dataset['functionId'];
        const detachedFunction = this.detachedFunctions?.find(({ id }) =>
          id === detachedFunctionId
        );
        const detachedFunctionBlock = detachedFunctionRenderer.querySelector(
          ':scope > .function-block'
        );
        if (!detachedFunction?.positionRelativeToRootFunc || !detachedFunctionBlock) {
          return;
        }
        const detachedBlockInRendererPosition = dom.position(
          detachedFunctionBlock,
          detachedFunctionRenderer
        );
        const newDetachedLeftCoord = rootFunctionBlockPosition.left +
          detachedFunction.positionRelativeToRootFunc.left -
          detachedBlockInRendererPosition.left;
        const newDetachedTopCoord = rootFunctionBlockPosition.top +
          detachedFunction.positionRelativeToRootFunc.top -
          detachedBlockInRendererPosition.top;
        dom.setStyles(detachedFunctionRenderer, {
          left: `${newDetachedLeftCoord}px`,
          top: `${newDetachedTopCoord}px`,
        });
      });
    }

    this.recalculateFunctionsContainerExtraMargin();
  },

  /**
   * @returns {void}
   */
  recalculateFunctionsContainerExtraMargin() {
    const functionsContainer = this.getFunctionsContainer();
    const detachedFunctionRenderers = this.element?.querySelectorAll(
      '.detached-functions-container > .function-renderer'
    ) ?? [];
    if (!functionsContainer) {
      return;
    }

    const overflowDetectors = {
      top: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).top * -1,
        0
      ),
      bottom: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).top + dom.height(funcRenderer) -
        dom.height(functionsContainer),
        0
      ),
      left: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).left * -1,
        0
      ),
      right: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).left + dom.width(funcRenderer) -
        dom.width(functionsContainer),
        0
      ),
    };
    const extraMargins = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    [...detachedFunctionRenderers].forEach((detachedFunctionRenderer) => {
      Object.keys(extraMargins).forEach((side) => {
        extraMargins[side] = Math.max(
          overflowDetectors[side](detachedFunctionRenderer),
          extraMargins[side]
        );
      });
    });

    Object.keys(extraMargins).forEach((side) => {
      functionsContainer.style.setProperty(
        `--margin-${side}-for-detached`,
        `${extraMargins[side]}px`
      );
    });
    this.scrollbarApi?.update();
  },

  /**
   * @returns {void}
   */
  resetDragDropExtraMargin() {
    const functionsContainer = this.getFunctionsContainer();
    if (!functionsContainer) {
      return;
    }
    ['top', 'bottom', 'left', 'right'].forEach((side) => {
      functionsContainer.style.setProperty(
        `--margin-${side}-for-dragdrop`,
        '0px'
      );
    });
    this.scrollbarApi?.update();
  },

  /**
   * @param {EdgeScrollerScrollEvent} event
   * @returns {void}
   */
  handleEdgeScrollerScroll(event) {
    const functionsContainer = this.getFunctionsContainer();
    if (!functionsContainer) {
      return;
    }

    event.scrollMovements.forEach((movement) => {
      if (movement.wantedDistance > movement.scrolledDistance) {
        const currentMarginForDragDrop = Number.parseFloat(
          functionsContainer.style
          .getPropertyValue(`--margin-${movement.targetDirection}-for-dragdrop`) ||
          '0'
        );
        functionsContainer.style.setProperty(
          `--margin-${movement.targetDirection}-for-dragdrop`,
          `${currentMarginForDragDrop + movement.wantedDistance}px`
        );
      }
    });
    this.scrollbarApi?.update();
  },

  /**
   * @type {HTMLDivElement | null}
   */
  getScrollableContainer() {
    return this.element?.querySelector('.ps') ?? null;
  },

  /**
   * @type {HTMLDivElement | null}
   */
  getFunctionsContainer() {
    return this.element?.querySelector('.functions-container') ?? null;
  },

  actions: {
    /**
     * @param {PerfectScrollbarApi} api
     * @returns {void}
     */
    registerScrollbarApi(api) {
      this.set('scrollbarApi', api);
    },

    /**
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase} chartFunction
     * @param {{ event: DropEvent }} additionalInfo
     * @returns {void}
     */
    acceptDraggedFunction(chartFunction, { event }) {
      if (!this.dragDrop.lastDragEvent) {
        return;
      }

      const elementOldPosition = dom.offset(this.dragDrop.lastDragEvent.target);
      const elementNewPosition = {
        top: event.pageY - this.dragDrop.lastDragEvent.offsetY,
        left: event.pageX - this.dragDrop.lastDragEvent.offsetX,
      };

      const leftOffset = elementNewPosition.left - elementOldPosition.left;
      const topOffset = elementNewPosition.top - elementOldPosition.top;

      const newPosition = {
        left: (chartFunction.positionRelativeToRootFunc?.left ?? 0) + leftOffset,
        top: (chartFunction.positionRelativeToRootFunc?.top ?? 0) + topOffset,
      };

      const action = this.actionsFactory.createChangeElementPropertyAction({
        element: chartFunction,
        propertyName: 'positionRelativeToRootFunc',
        newValue: newPosition,
        changeType: 'discrete',
      });
      action.execute();
    },
  },
});
