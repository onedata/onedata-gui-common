import Component from '@ember/component';
import EmberObject, { observer, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  chartElementIcons,
  ElementType,
  getUnnamedElementNamePlaceholder,
  translateValidationErrorsBatch,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-editor';

const editorComponents = Object.freeze({
  [ElementType.Series]: 'series-editor',
  [ElementType.SeriesGroup]: 'series-group-editor',
  [ElementType.Axis]: 'axis-editor',
});

export default Component.extend(I18n, {
  layout,
  classNames: ['chart-editor-elements-editor'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.elementsEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement | null}
   */
  selectedElement: null,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Array<ElementsEditorTab>}
   */
  tabs: undefined,

  /**
   * @type {ElementsEditorTab | null}
   */
  selectedTab: null,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  namePlaceholder: computed(function namePlaceholder() {
    return getUnnamedElementNamePlaceholder(this.i18n);
  }),

  selectedElementObserver: observer(
    'selectedElement',
    function selectedElementObserver() {
      this.consumeNewSelectedElement();
    }
  ),

  removedElementsTabCleaner: observer(
    'tabs.@each.isElementRemoved',
    function removedElementsTabCleaner() {
      if (this.selectedTab?.isElementRemoved) {
        const nextSelectedTabCandidate = this.findNextSelectedTabCandidate();
        this.set('selectedTab', nextSelectedTabCandidate);
      }

      const tabsToRemove = new Set(this.tabs.filter((tab) => tab.isElementRemoved));
      if (tabsToRemove.size) {
        tabsToRemove.forEach((tab) => tab.destroy());
        this.set('tabs', this.tabs.filter((tab) => !tabsToRemove.has(tab)));
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.set('tabs', []);
    this.consumeNewSelectedElement();
  },

  /**
   * @returns {void}
   */
  consumeNewSelectedElement() {
    if (!this.selectedElement) {
      return;
    }

    let tabForSelectedElement =
      this.tabs.find(({ element }) => element === this.selectedElement);
    if (!tabForSelectedElement) {
      tabForSelectedElement = this.createTabForElement(this.selectedElement);
      this.set('tabs', [...this.tabs, tabForSelectedElement]);
    }

    if (this.selectedTab !== tabForSelectedElement) {
      this.set('selectedTab', tabForSelectedElement);
    }
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement} element
   * @returns {ElementsEditorTab}
   */
  createTabForElement(element) {
    return ElementsEditorTab.create({
      ownerSource: this,
      element,
    });
  },

  /**
   * @returns {ElementsEditorTab | null}
   */
  findNextSelectedTabCandidate() {
    const selectedTabIndex = this.tabs.indexOf(this.selectedTab);
    if (selectedTabIndex > -1) {
      const newSelectedTabCandidates = [
        ...this.tabs.slice(0, selectedTabIndex).reverse(),
        ...this.tabs.slice(selectedTabIndex + 1),
      ].filter((tab) => !tab.isElementRemoved);
      if (newSelectedTabCandidates[0]) {
        return newSelectedTabCandidates[0];
      }
    }
    return null;
  },

  openTab(tab) {
    const selectAction = this.actionsFactory.createSelectElementAction({
      elementToSelect: tab.element,
    });
    selectAction.execute();
  },

  actions: {
    /**
     * @param {ElementsEditorTab} tab
     * @param {MouseEvent} event
     * @returns {void}
     */
    openTab(tab, event) {
      if (isDirectlyClicked(event)) {
        this.openTab(tab);
      }
    },

    /**
     * @param {ElementsEditorTab} tab
     * @returns {void}
     */
    closeTab(tab) {
      if (this.selectedTab === tab) {
        const nextSelectedTabCandidate = this.findNextSelectedTabCandidate();
        const selectAction = this.actionsFactory.createSelectElementAction({
          elementToSelect: nextSelectedTabCandidate?.element,
          elementsToDeselect: [tab.element],
        });
        selectAction.execute();
      }
      tab.destroy();
      this.set('tabs', this.tabs.filter((t) => t !== tab));
    },
  },
});

const ElementsEditorTab = EmberObject.extend(OwnerInjector, {
  i18n: service(),

  /**
   * @public
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement}
   */
  element: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  id: computed(function id() {
    return `${guidFor(this)}-tab`;
  }),

  /**
   * @public
   * @virtual
   * @type {ComputedProperty<string | null>}
   */
  icon: computed('element.elementType', function icon() {
    return chartElementIcons[this.element.elementType] ?? null;
  }),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  validationErrorsMessage: computed(
    'element.validationErrors',
    function validationErrorsMessage() {
      return translateValidationErrorsBatch(
        this.i18n,
        this.element.validationErrors,
      );
    }
  ),

  /**
   * @public
   * @virtual
   * @type {ComputedProperty<string | null>}
   */
  editorComponentName: computed(
    'element.elementType',
    function editorComponentName() {
      return editorComponents[this.element.elementType] ?? null;
    }
  ),

  /**
   * @public
   * @type {ComputedProperty<boolean>}
   */
  isElementRemoved: reads('element.isRemoved'),
});
