/**
 * Content of popup with information about group
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import layout from '../templates/components/group-info-content';
import { promise } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,
  classNames: ['group-info-content'],

  router: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.groupInfoContent',

  /**
   * @virtual
   * @type {Models.Group}
   */
  record: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showDetails: true,

  /**
   * Promise proxy used to load group members
   * @type {Ember.ComputedProperty<PromiseArray>}
   */
  groupMembersLoadingProxy: promise.array(
    promise.all('record.effGroupList', 'record.groupList')
  ),

  /**
   * Promise proxy used to load user members
   * @type {Ember.ComputedProperty<PromiseArray>}
   */
  userMembersLoadingProxy: promise.array(
    promise.all('record.effUserList', 'record.userList')
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  groupType: computed('record.type', function groupType() {
    if (this.record.type) {
      return this.t(this.record.type.replace('_', ''), {}, {
        defaultValue: this.record.type.replace('_', ' '),
      });
    } else {
      return '—';
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  linkToGroup: computed('record', function linkToGroup() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'groups',
      this.guiUtils.getRoutableIdFor(this.record),
      'members'
    );
  }),
});
