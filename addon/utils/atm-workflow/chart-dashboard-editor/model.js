/**
 * Main model for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, set, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default EmberObject.extend({
  /**
   * @public
   * @virtual
   * @type {unknown}
   */
  elementsOwner: undefined,

  /**
   * @public
   * @virtual
   * @type {Array<ChartDashboardEditorDataSource>}
   */
  dataSources: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Section | null}
   */
  rootSection: null,

  /**
   * @private
   * @type {Set<() => void>}
   */
  changeListeners: undefined,

  /**
   * Reference to the previously used `rootSection`. Needed to detach observers
   * from the old `rootSection` when the new `rootSection` is set.
   * @private
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Section | null}
   */
  prevRootSection: null,

  /**
   * @private
   * @type {ComputedProperty<() => void>}
   */
  rootSectionChangeListener: computed(function rootSectionChangeListener() {
    return () => scheduleOnce('afterRender', this, 'notifyAboutChange');
  }),

  rootSectionObserver: observer('rootSection', function rootSectionObserver() {
    if (this.prevRootSection === this.rootSection) {
      return;
    }

    this.prevRootSection?.removeChangeListener(this.rootSectionChangeListener);
    this.set('prevRootSection', this.rootSection);
    this.rootSection?.addChangeListener(this.rootSectionChangeListener);

    // Trigger change event after replacing `rootSection`
    this.rootSectionChangeListener();
  }),

  dataSourcesAssigner: observer(
    'rootSection',
    'dataSources',
    function dataSourcesAssigner() {
      if (!this.rootSection) {
        return;
      }

      const allElements = [
        this.rootSection,
        ...this.rootSection.nestedElements(),
      ];
      allElements.forEach((element) => {
        if (element.dataSources !== this.dataSources) {
          set(element, 'dataSources', this.dataSources);
        }
      });
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.setProperties({
      changeListeners: new Set(),
      prevRootSection: this.rootSection,
    });
    this.rootSection?.addChangeListener(this.rootSectionChangeListener);
    this.rootSectionObserver();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.rootSection?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @returns {AtmTimeSeriesDashboardSpec | null}
   */
  toJson() {
    const rootSectionJson = this.rootSection?.toJson();
    return rootSectionJson ? { rootSection: rootSectionJson } : null;
  },

  /**
   * @public
   * @param {() => void} changeListener
   * @returns {void}
   */
  addChangeListener(changeListener) {
    this.changeListeners.add(changeListener);
  },

  /**
   * @public
   * @param {() => void} changeListener
   * @returns {void}
   */
  removeChangeListener(changeListener) {
    this.changeListeners.delete(changeListener);
  },

  /**
   * @private
   * @returns {void}
   */
  notifyAboutChange() {
    safeExec(this, () => {
      this.changeListeners.forEach((listener) => listener());
    });
  },
});
