/**
 * Base class for every dashboard element model.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { array } from 'ember-awesome-macros';

/**
 * @typedef {Object} DashboardElementReference
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} referencingElement
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} referencedElement
 * @property {string} propertyName
 * @property {number} [positionInArray]
 */

/**
 * @typedef {Object} ChangeEvent
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ElementBase} target
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ElementBase} currentTarget
 */

const ElementBase = EmberObject.extend({
  /**
   * @public
   * @virtual
   * @readonly
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType}
   */
  elementType: undefined,

  /**
   * @public
   * @readonly
   * @type {unknown}
   */
  elementOwner: null,

  /**
   * @public
   * @virtual
   * @type {Array<ChartsDashboardEditorDataSource>}
   */
  dataSources: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null}
   */
  parent: null,

  /**
   * @public
   * @type {boolean}
   */
  isRemoved: false,

  /**
   * @public
   * @type {Array<DashboardElementValidationError>}
   */
  directValidationErrors: undefined,

  /**
   * @public
   * @type {Array<DashboardElementValidationError>}
   */
  nestedValidationErrors: undefined,

  /**
   * @type {Set<ChartsDashboardEditorElementChangeEvent>}
   */
  changeListeners: undefined,

  /**
   * An array of properties, which may contain references to other dashboard
   * elements.
   * @private
   * @virtual optional
   * @type {Array<string>}
   */
  referencingPropertyNames: Object.freeze(['parent']),

  /**
   * @public
   * @type {Computed<Array<DashboardElementValidationError>>}
   */
  validationErrors: array.concat('directValidationErrors', 'nestedValidationErrors'),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('changeListeners', new Set());
    if (!this.directValidationErrors) {
      this.set('directValidationErrors', []);
    }
    if (!this.nestedValidationErrors) {
      this.set('nestedValidationErrors', []);
    }
    if (!this.referencingPropertySpecs) {
      this.set('referencingPropertySpecs', []);
    }
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.elementOwner) {
        this.set('elementOwner', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @public
   * @virtual
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement}
   */
  clone() {},

  /**
   * @public
   * @virtual
   * @returns {unknown}
   */
  toJson() {},

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ChangeEvent} changeListener
   * @returns {void}
   */
  addChangeListener(changeListener) {
    this.changeListeners.add(changeListener);
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ChangeEvent} changeListener
   * @returns {void}
   */
  removeChangeListener(changeListener) {
    this.changeListeners.delete(changeListener);
  },

  /**
   * Notifies about change of this element. It doesn't have to be a direct change -
   * changes in child element will also trigger such notification in every parent,
   * so called "event bubbling".
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ElementBase} [changeTarget]
   *   Element which triggered the event. Might be different than `this` when
   *   event bubbles up through the elements tree. In that case it points to
   *   one of the child elements.
   * @returns {void}
   */
  notifyAboutChange(changeTarget = this) {
    const event = {
      target: changeTarget,
      currentTarget: this,
    };
    this.changeListeners.forEach((listener) => listener(event));
    this.parent?.notifyAboutChange(changeTarget);
  },

  /**
   * @public
   * @returns {Generator<Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement>}
   */
  * nestedElements() {},

  /**
   * @public
   * @returns {Generator<Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement>}
   */
  * referencingElements() {},

  /**
   * Removes any references to `element` from this object.
   * NOTE: it does it only on the top level - does not analyze nested objects!
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} element
   * @returns {Array<DashboardElementReference>} Array of reference specs of
   *   removed `element` occurrences.
   */
  removeElementReferences(element) {
    const removedReferences = [];

    for (const propertyName of this.referencingPropertyNames) {
      const propertyValue = this[propertyName];

      if (Array.isArray(propertyValue)) {
        let newPropertyValue = propertyValue;
        let indexOfElementToRemove = propertyValue.indexOf(element);

        while (indexOfElementToRemove !== -1) {
          newPropertyValue = [
            ...newPropertyValue.slice(0, indexOfElementToRemove),
            ...newPropertyValue.slice(indexOfElementToRemove + 1),
          ];
          removedReferences.push({
            referencingElement: this,
            referencedElement: element,
            propertyName,
            positionInArray: indexOfElementToRemove,
          });
          indexOfElementToRemove = newPropertyValue.indexOf(element);
        }

        if (newPropertyValue !== propertyValue) {
          this.set(propertyName, newPropertyValue);
        }
      } else if (propertyValue === element) {
        this.set(propertyName, null);
        removedReferences.push({
          referencingElement: this,
          referencedElement: element,
          propertyName,
        });
      }
    }

    return removedReferences;
  },

  /**
   * Rollbacks reference removal according to reference spec passed via argument.
   * @param {DashboardElementReference} removedReference
   * @returns {void}
   */
  rollbackReferenceRemoval(removedReference) {
    const {
      referencingElement,
      referencedElement,
      propertyName,
      positionInArray,
    } = removedReference;

    if (referencingElement !== this) {
      return;
    }

    if (Array.isArray(this[propertyName])) {
      if (typeof positionInArray !== 'number') {
        return;
      }

      this.set(propertyName, [
        ...this[propertyName].slice(0, positionInArray),
        referencedElement,
        ...this[propertyName].slice(positionInArray),
      ]);
    } else {
      this.set(propertyName, referencedElement);
    }
  },
});

export default ElementBase;
