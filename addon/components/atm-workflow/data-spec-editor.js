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
});
