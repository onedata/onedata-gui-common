import Component from '@ember/component';
import EmberObject, { observer, computed, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { chartElementIcons } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements-editor';

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
      let newTabs = this.tabs;
      const temporaryTab = this.tabs.find((tab) => tab.isTemporary);
      if (temporaryTab) {
        temporaryTab.destroy();
        newTabs = newTabs.filter((tab) => tab !== temporaryTab);
      }
      this.set('tabs', [...newTabs, tabForSelectedElement]);
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
    return ElementsEditorTab.create({ element });
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
     * @returns {void}
     */
    openTab(tab) {
      this.openTab(tab);
    },

    /**
     * @param {ElementsEditorTab} tab
     * @returns {void}
     */
    openAndPreserveTab(tab) {
      this.openTab(tab);
      set(tab, 'isTemporary', false);
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

const ElementsEditorTab = EmberObject.extend({
  /**
   * @public
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ChartElement}
   */
  element: undefined,

  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  isTemporary: true,

  /**
   * @type {ComputedProperty<string>}
   */
  id: computed(function id() {
    return `${guidFor(this)}-tab`;
  }),

  /**
   * @public
   * @virtual
   * @type {string | null}
   */
  icon: computed('element.elementType', function icon() {
    return chartElementIcons[this.element.elementType] ?? null;
  }),

  /**
   * @public
   * @type {ComputedProperty<boolean>}
   */
  isElementRemoved: reads('element.isRemoved'),
});
