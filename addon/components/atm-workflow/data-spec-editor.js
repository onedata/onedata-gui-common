/**
 * A field element component which renders data spec editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/atm-workflow/data-spec-editor';

export default FieldComponentBase.extend({
  layout,
  classNames: ['data-spec-editor'],

  /**
   * @type {ComputedProperty<Map<string, DataSpecEditorElementContext>>}
   */
  editorElementsContextMap: reads('field.editorElementsContextMap'),

  /**
   * @type {ComputedProperty<Array<AtmDataSpecFilter>>}
   */
  dataSpecFilters: reads('field.dataSpecFilters'),
});
