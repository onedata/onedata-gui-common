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

  linkToGroup: computed('record', function linkToFileBrowser() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'groups',
      this.guiUtils.getRoutableIdFor(this.record),
      'members'
    );
  }),
});
