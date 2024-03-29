/**
 * A component responsible for rendering privileges field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
  treeValue: computed('privilegesGroups', 'value.privileges', function treeValue() {
    return privilegesArrayToObject(this.value?.privileges ?? [], this.privilegesGroups);
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  compareTreeValue: computed(
    'privilegesGroups',
    'defaultValue.privileges',
    function compareTreeValue() {
      return privilegesArrayToObject(
        this.defaultValue?.privileges ?? [],
        this.privilegesGroups
      );
    }
  ),

  actions: {
    valueChanged(value) {
      const oneLevelTree = _.assign({}, ..._.values(value));
      const flattenedPrivileges = _.keys(oneLevelTree)
        .filter(privilegeName => oneLevelTree[privilegeName]);

      return this._super({
        privilegesTarget: this.value?.privilegesTarget,
        privileges: flattenedPrivileges,
      });
    },
  },
});
