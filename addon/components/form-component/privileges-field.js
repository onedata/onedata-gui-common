import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/privileges-field';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import _ from 'lodash';
import privilegesArrayToObject from 'onedata-gui-common/utils/privileges-array-to-object';
import { raw, or } from 'ember-awesome-macros';

export default FieldComponentBase.extend({
  layout,
  classNames: ['privileges-field'],

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  privilegesGroups: or('field.privilegesGroups', raw([])),

  /**
   * @type {ComputedProperty<String>}
   */
  privilegeGroupsTranslationsPath: reads('field.privilegeGroupsTranslationsPath'),

  /**
   * @type {ComputedProperty<String>}
   */
  privilegesTranslationsPath: reads('field.privilegesTranslationsPath'),

  /**
   * @type {ComputedProperty<Object>}
   */
  treeValue: computed('privilegesGroups', 'value', function treeValue() {
    let {
      privilegesGroups,
      value,
    } = this.getProperties('privilegesGroups', 'value');
    value = value || [];

    return privilegesArrayToObject(value, privilegesGroups);
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  compareTreeValue: computed(
    'privilegesGroups',
    'defaultValue',
    function compareTreeValue() {
      let {
        privilegesGroups,
        defaultValue,
      } = this.getProperties('privilegesGroups', 'defaultValue');
      defaultValue = defaultValue || [];

      return privilegesArrayToObject(defaultValue, privilegesGroups);
    }
  ),

  actions: {
    valueChanged(value) {
      const oneLevelTree = _.assign({}, ..._.values(value));
      const flattenedValue = _.keys(oneLevelTree)
        .filter(privilegeName => oneLevelTree[privilegeName]);

      return this._super(flattenedValue);
    }
  },
});
