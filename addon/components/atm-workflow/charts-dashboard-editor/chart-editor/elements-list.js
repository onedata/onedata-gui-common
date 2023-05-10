import PerfectScrollbarElement from 'onedata-gui-common/components/perfect-scrollbar-element';
import EmberObject, { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import _ from 'lodash';
import {
  isChartElementType,
  EdgeScroller,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import dom from 'onedata-gui-common/utils/dom';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-list';

/**
 * @typedef {Object} ElementsListDropZone
 * @property {SafeString} style
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement} referenceElement
 * @property {MoveElementActionNewPosition['position'] | 'inside'} placement
 */

export const ElementsListItemModel = EmberObject.extend({
  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement}
   */
  item: undefined,

  /**
   * @virtual
   * @type {string}
   */
  renderer: undefined,

  /**
   * @type {ElementsListItemModel}
   */
  nestedModels: undefined,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.nestedModels) {
      this.set('nestedModels', []);
    }
  },

  /**
   * @returns {Array<Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement>}
   */
  getAllNestedItems() {
    const elementTypeToReturn = this.item.elementType;
    return [...this.item.getNestedElements()]
      .filter((element) => element.elementType === elementTypeToReturn);
  },
});

export default PerfectScrollbarElement.extend({
  layout,
  classNames: ['elements-list'],

  dragDrop: service(),

  /**
   * @virtual
   * @type {Array<ElementsListItemModel>}
   */
  itemModels: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowDragDrop: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowNesting: false,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EdgeScroller}
   */
  edgeScroller: undefined,

  /**
   * @type {Array<ElementsListDropZone>}
   */
  dropZones: null,

  edgeScrollerEnabler: observer(
    'dragDrop.draggedElementModel.elementType',
    function edgeScrollerEnabler() {
      const draggedElementType = this.dragDrop.draggedElementModel?.elementType;
      if (isChartElementType(draggedElementType)) {
        this.edgeScroller?.enable();
      } else {
        this.edgeScroller?.disable();
      }
    }
  ),

  dropZonesSetter: observer(
    'dragDrop.draggedElementModel',
    'allowNesting',
    function dropZonesSetter() {
      this.recalculateDropZones();
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.edgeScrollerEnabler();
    this.dropZonesSetter();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.set('edgeScroller', new EdgeScroller(this.element));
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.edgeScroller?.destroy();
      this.set('edgeScroller', undefined);
    } finally {
      this._super(...arguments);
    }
  },

  recalculateDropZones() {
    const draggedElement = this.dragDrop.draggedElementModel;
    const firstItem = this.itemModels[0]?.item;
    if (
      !this.allowDragDrop ||
      !draggedElement ||
      !firstItem ||
      firstItem.elementOwner !== draggedElement.elementOwner ||
      firstItem.elementType !== draggedElement.elementType
    ) {
      this.set('dropZones', []);
      return;
    }

    const elementNodes = [
      ...(this.element?.querySelectorAll('.elements-list-item') ?? []),
    ];
    const elementIdsWithoutDrop = new Set([
      draggedElement.id,
      ...[...draggedElement.getNestedElements()].map((elem) => elem.id),
    ]);
    const elementNodesForDrop = elementNodes.filter((node) =>
      !elementIdsWithoutDrop.has(node.dataset.elementId)
    );
    const allItemsMap = this.getAllItemsMap();

    const dropZones = [];
    const sideDropZoneHeight = 12;
    for (const elementNode of elementNodesForDrop) {
      const element = allItemsMap.get(elementNode.dataset.elementId);
      if (!element) {
        continue;
      }

      const scrollUnawarePosition = dom.position(elementNode, this.element);
      const scrollAwarePosition = {
        top: scrollUnawarePosition.top +
          this.element.scrollTop -
          Number.parseFloat(dom.getStyle(this.element, 'borderTopWidth')),
        left: scrollUnawarePosition.left,
      };

      if (this.allowNesting) {
        const top = scrollAwarePosition.top;
        const left = scrollAwarePosition.left;
        const height = dom.height(elementNode);
        const width = dom.width(elementNode);
        dropZones.push({
          style: htmlSafe(
            `top: ${top}px; left: ${left}px; height: ${height}px; width: ${width}px;`
          ),
          referenceElement: element,
          placement: 'inside',
        });
      }

      // First element
      if (!elementNode.previousElementSibling) {
        const top = scrollAwarePosition.top - sideDropZoneHeight / 2;
        const left = scrollAwarePosition.left;
        const height = sideDropZoneHeight;
        const width = dom.width(elementNode);
        dropZones.push({
          style: htmlSafe(
            `top: ${top}px; left: ${left}px; height: ${height}px; width: ${width}px;`
          ),
          referenceElement: element,
          placement: 'before',
        });
      }

      // Element at the end or followed by a valid drop target
      if (
        !elementNode.nextElementSibling ||
        elementNodesForDrop.includes(elementNode.nextElementSibling)
      ) {
        const top = scrollAwarePosition.top +
          dom.height(elementNode) -
          Number.parseFloat(dom.getStyle(elementNode, 'borderBottomWidth')) -
          sideDropZoneHeight / 2;
        const left = scrollAwarePosition.left;
        const height = sideDropZoneHeight;
        const width = dom.width(elementNode);
        dropZones.push({
          style: htmlSafe(
            `top: ${top}px; left: ${left}px; height: ${height}px; width: ${width}px;`
          ),
          referenceElement: element,
          placement: 'after',
        });
      }
    }

    if (
      // if there is something to render
      this.itemModels.length &&
      // and there is no Y overflow
      this.element?.scrollHeight <= this.element?.clientHeight
    ) {
      // Find last element node and its "after" drop zone
      const lastElement = this.itemModels[this.itemModels.length - 1]?.item;
      const lastElementNode = this.element
        ?.querySelector(`.elements-list-item[data-element-id="${lastElement.id}"`);
      const afterDropZone = dropZones.find(({ referenceElement, placement }) =>
        referenceElement === lastElement && placement === 'after'
      );
      if (afterDropZone && lastElementNode) {
        const lastElementPosition = dom.position(lastElementNode, this.element);
        const lastElementHeight = dom.height(lastElementNode);
        const lastElementBottomEdge = lastElementPosition.top + lastElementHeight;
        // space between the last element and the bottom edge of this component
        const spaceLeftAfter = dom.height(this.element, dom.LayoutBox.ContentBox) -
          lastElementBottomEdge;
        if (spaceLeftAfter > sideDropZoneHeight * 2) {
          // Having enough space we can render a higher drop zone which would
          // better show that dragged element will end up at the end of the
          // list.
          const lastDropZoneHeight = Math.min(
            spaceLeftAfter - sideDropZoneHeight,
            dom.height(lastElementNode.querySelector('.list-item-header'))
          );
          afterDropZone.style = htmlSafe(
            `top: ${lastElementBottomEdge + sideDropZoneHeight / 2}px; ` +
            `left: ${lastElementPosition.left}px; ` +
            `height: ${lastDropZoneHeight}px; ` +
            `width: ${dom.width(lastElementNode)}px;`
          );
        }
      }
    }

    this.set('dropZones', dropZones);
  },

  /**
   * @returns {Map<string, Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement>}
   */
  getAllItemsMap() {
    const itemsArray = [
      ...this.itemModels.map((model) => model.item),
      ..._.flatten(this.itemModels.map((model) => model.getAllNestedItems())),
    ];
    return new Map(itemsArray.map((item) => [item.id, item]));
  },

  actions: {
    /**
     * @param {ElementsListDropZone['referenceElement']} referenceElement
     * @param {ElementsListDropZone['placement']} placement
     * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement}
     * @returns {void}
     */
    acceptDrop(referenceElement, placement, draggedElement) {
      const action = this.actionsFactory.createMoveElementAction({
        movedElement: draggedElement,
        newParent: placement === 'inside' ?
          referenceElement : referenceElement.parent,
        newPosition: placement === 'inside' ? null : {
          placement,
          referenceElement,
        },
      });
      action.execute();
    },
  },
});
