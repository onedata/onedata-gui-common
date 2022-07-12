/**
 * Renders a representation of the "array" data spec type. Depending on the current
 * state of the editor, it renders array item data type element or a dropdown which allows
 * to select one.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { translateDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/array-data-type-editor';

export default Component.extend({
  classNames: ['data-type-editor', 'array-data-type-editor'],
  layout,

  i18n: service(),

  /**
   * @virtual
   * @type {FormElementMode}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isEnabled: undefined,

  /**
   * @virtual
   * @type {AtmDataSpecPlacementContext}
   */
  placementContext: undefined,

  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @virtual
   * @type {DataSpecEditorElement}
   */
  editorElement: undefined,

  /**
   * @type {Map<string, DataSpecEditorElementContext>}
   */
  editorElementsContextMap: undefined,

  /**
   * @virtual
   * @type {(updatedElement: DataSpecEditorElement) => void}
   */
  onElementChange: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onFocusLost: undefined,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  dataTypeTranslation: computed(function dataTypeTranslation() {
    return translateDataSpecType(this.get('i18n'), 'array');
  }),

  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFiltersForItems: computed(
    'dataSpecFilters',
    function dataSpecFiltersForItems() {
      const dataSpecFilters = this.get('dataSpecFilters') || [];
      return dataSpecFilters.map((dataSpecFilter) => {
        switch (dataSpecFilter.filterType) {
          case 'typeOrSupertype':
          case 'typeOrSubtype': {
            const itemTypes = dataSpecFilter.types.map((type) =>
              extractItemTypeFromArrayDataSpec(type)).compact();
            return itemTypes.length ? Object.assign({}, dataSpecFilter, {
              types: itemTypes,
            }) : null;
          }
          case 'forbiddenType':
            return dataSpecFilter;
          default:
            return null;
        }
      }).filter(Boolean);
    }
  ),

  /**
   * @param {DataSpecEditorElement} updatedElement
   * @returns {void}
   */
  notifyElementChange(updatedElement) {
    const onElementChange = this.get('onElementChange');

    if (onElementChange) {
      onElementChange(updatedElement);
    }
  },

  actions: {
    itemElementChanged(itemElement) {
      this.notifyElementChange(Object.assign({}, this.get('editorElement'), {
        config: Object.assign({}, this.get('editorElement.config'), {
          item: itemElement,
        }),
      }));
    },
  },
});

function extractItemTypeFromArrayDataSpec(arrayDataSpec) {
  if (
    !arrayDataSpec ||
    arrayDataSpec.type !== 'array' ||
    !get(arrayDataSpec, 'valueConstraints.itemDataSpec')
  ) {
    return null;
  }

  return arrayDataSpec.valueConstraints.itemDataSpec;
}
