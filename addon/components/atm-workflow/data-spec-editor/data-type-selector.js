/**
 * Renders dropdown element with all possible data spec types. "Possible", because
 * types can be narrowed by `dataSpecFilters`.
 *
 * It's the main component for building data specs in a typical happy path.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  dataSpecTypes,
  translateDataSpecType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { getMatchingAtmDataSpecTypes } from 'onedata-gui-common/utils/atm-workflow/data-spec/filters';
import { createDataTypeElement } from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/editor-element-creators';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-selector';

export default Component.extend(I18n, {
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.dataSpecEditor.dataTypeSelector',

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
   * @type {DataSpecEditorElement|null}
   */
  parentEditorElement: undefined,

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
   * @type {ComputedProperty<{ value: string, label: SafeString }>}
   */
  selectorOptions: computed('dataSpecFilters', function selectorOptions() {
    const {
      i18n,
      dataSpecFilters,
    } = this.getProperties('i18n', 'dataSpecFilters');

    const allowedDataSpecTypes = getMatchingAtmDataSpecTypes(dataSpecFilters);
    return dataSpecTypes
      .filter((type) => allowedDataSpecTypes.includes(type))
      .map((dataSpecType) => ({
        value: dataSpecType,
        label: translateDataSpecType(i18n, dataSpecType),
      }));
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  selectorPlaceholder: computed('placementContext', function selectorPlaceholder() {
    const placementContext = this.get('placementContext');
    const translationName = placementContext === 'array' ? 'array' : 'default';
    return this.t(`placeholder.${translationName}`);
  }),

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
    dataTypeSelected({ value: dataType }) {
      this.notifyElementChange(createDataTypeElement(dataType));
    },
  },
});
