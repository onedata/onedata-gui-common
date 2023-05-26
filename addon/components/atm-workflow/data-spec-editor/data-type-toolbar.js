/**
 * Renders a simple toolbar with actions specific for data types. Allows:
 * - removing editor element,
 * - wrapping existing element with an array,
 * - flattening array to it's item's type.
 *
 * Some buttons can be hidden if are not applicable due to the current
 * `dataSpecFilters`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  createDataTypeSelectorElement,
  createDataTypeElement,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/editor-element-creators';
import { isAtmDataSpecMatchingFilters } from 'onedata-gui-common/utils/atm-workflow/data-spec/filters';
import { formValuesToDataSpec } from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import paramsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/params-editors';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-toolbar';

export default Component.extend(I18n, {
  layout,
  classNames: ['data-type-toolbar'],
  classNameBindings: ['isEnabled::disabled'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.dataSpecEditor.dataTypeToolbar',

  /**
   * @virtual
   * @type {boolean}
   */
  isEnabled: undefined,

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
   * @virtual
   * @type {(updatedElement: DataSpecEditorElement) => void}
   */
  onElementChange: undefined,

  /**
   * @type {boolean}
   */
  isRemoveWarnOpened: false,

  /**
   * @type {ComputedProperty<boolean>}
   */
  canUnpackFromArray: computed(
    'editorElement.config.dataType',
    'dataSpecFilters',
    function canUnpackFromArray() {
      if (this.get('editorElement.config.dataType') !== 'array') {
        return false;
      }

      const itemDataSpec = formValuesToDataSpec(this.get('editorElement.config.item'));
      return isAtmDataSpecMatchingFilters(itemDataSpec, this.dataSpecFilters);
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canPackIntoArray: computed(
    'editorElement',
    'dataSpecFilters',
    function canPackIntoArray() {
      const {
        editorElement,
        dataSpecFilters,
      } = this.getProperties(
        'editorElement',
        'dataSpecFilters',
      );

      const packedDataSpec = {
        type: 'array',
        itemDataSpec: formValuesToDataSpec(editorElement),
      };
      return isAtmDataSpecMatchingFilters(
        packedDataSpec,
        dataSpecFilters,
      );
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  shouldWarnOnRemove: computed(
    'editorElement.config.{dataType,formValues.dataTypeEditor}',
    function shouldWarnOnRemove() {
      const dataType = this.get('editorElement.config.dataType');
      if (
        dataType === 'array' &&
        this.get('editorElement.config.item.type') === 'dataType'
      ) {
        return true;
      } else if (dataType in paramsEditors) {
        return paramsEditors[dataType].shouldWarnOnRemove(
          this.get('editorElement.config.formValues.dataTypeEditor')
        );
      } else {
        return false;
      }
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
    remove() {
      if (!this.get('isEnabled')) {
        return;
      }

      this.notifyElementChange(createDataTypeSelectorElement());
    },
    toggleRemoveWarn(newState) {
      const calculatedState = newState !== undefined ?
        Boolean(newState) : !this.get('isRemoveWarnOpened');

      if (!this.get('isEnabled') && calculatedState) {
        return;
      }

      this.set('isRemoveWarnOpened', calculatedState);
    },
    packIntoArray() {
      if (!this.get('isEnabled')) {
        return;
      }

      this.notifyElementChange(createDataTypeElement('array', {
        item: this.get('editorElement'),
      }));
    },
    unpackFromArray() {
      if (!this.get('isEnabled')) {
        return;
      }

      this.notifyElementChange(
        this.get('editorElement.config.item') || createDataTypeSelectorElement()
      );
    },
  },
});
