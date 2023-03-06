/**
 * Privileges tree editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { A } from '@ember/array';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/privileges-tree-editor';

export default Component.extend({
  layout,
  classNames: ['privileges-tree-editor'],

  i18n: service(),

  /**
   * Grouped privileges used to construct tree nodes
   * @virtual
   * @type {Array<Object>}
   */
  privilegesGroups: Object.freeze([]),

  /**
   * Path to the translations of privilege groups names
   * @virtual
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of privileges names
   * @virtual
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * State of the privileges, which will override tree state on change.
   * @virtual
   * @type {Object}
   */
  overridePrivileges: undefined,

  /**
   * State of privileges used to calculate modificaton state of tree
   * @type {Ember.ComputedProperty<Object>}
   */
  comparePrivileges: reads('overridePrivileges'),

  /**
   * If false, edition will be not available.
   * @virtual
   * @type {boolean}
   */
  editionEnabled: true,

  /**
   * @type {Function}
   * @param {Object} data actual values of privileges tree (compatible
   *   with overridePrivileges)
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * First overridePrivileges.
   * @type {Object}
   */
  initialPrivileges: undefined,

  /**
   * @virtua optional
   * @type {boolean}
   */
  allowThreeStateToggles: true,

  /**
   * Tree definition
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  initialTreeState: computed(
    'allowThreeStateToggles',
    'initialPrivileges',
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    function initialTreeState() {
      const {
        allowThreeStateToggles,
        initialPrivileges,
        privilegesGroups,
        privilegeGroupsTranslationsPath,
        privilegesTranslationsPath,
        i18n,
      } = this.getProperties(
        'allowThreeStateToggles',
        'initialPrivileges',
        'privilegesGroups',
        'privilegeGroupsTranslationsPath',
        'privilegesTranslationsPath',
        'i18n'
      );
      if (!initialPrivileges) {
        return [];
      }
      return privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          const threeStatePermission = allowThreeStateToggles &&
            initialPrivileges[groupName][privilege.name] === 2;
          return {
            name: privilege.name,
            text: i18n.t(privilegesTranslationsPath + '.' + privilege.name),
            field: {
              type: 'checkbox',
              threeState: threeStatePermission,
              allowThreeStateToggle: threeStatePermission,
            },
          };
        });
        return {
          name: groupName,
          icon: privilegesGroup.icon,
          text: i18n.t(privilegeGroupsTranslationsPath + '.' + groupName),
          allowSubtreeCheckboxSelect: true,
          subtree: privilegesNodes,
        };
      });
    }
  ),

  /**
   * Tree paths, which are disabled for edition. Used to block tree edition.
   * @type {Ember.ComputedProperty<Ember.Array<string>>}
   */
  treeDisabledPaths: computed(
    'editionEnabled',
    'privilegesGroups',
    function treeDisabledPaths() {
      const {
        editionEnabled,
        privilegesGroups,
      } = this.getProperties('editionEnabled', 'privilegesGroups');
      return editionEnabled ? A() : A(privilegesGroups.map(g => g.groupName));
    }
  ),

  overridePrivilegesObserver: observer(
    'overridePrivileges',
    function overridePrivilegesObserver() {
      const {
        overridePrivileges,
        initialPrivileges,
      } = this.getProperties('overridePrivileges', 'initialPrivileges');
      if (!initialPrivileges && overridePrivileges) {
        this.set('initialPrivileges', overridePrivileges);
      }
    }
  ),

  init() {
    this._super(...arguments);

    this.overridePrivilegesObserver();
  },

  actions: {
    treeValuesChanged(values) {
      this.get('onChange')(values);
    },
  },
});
