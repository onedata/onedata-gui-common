/**
 * Content of popup with information about space
 * 
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import layout from '../templates/components/space-info-content';

export default Component.extend(I18n, {
  layout,
  classNames: ['space-info-content'],

  userManager: service(),
  modalManager: service(),
  router: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceInfoContent',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  showRestApiModalLink: true,

  /**
   * @type {Models.User}
   */
  owner: computed('space.info.creatorId', function owner() {
    return this.userManager.getRecordById(this.space.info.creatorId);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  creationTime: computed('space.info.creationTime', function creationTime() {
    const timestamp = this.space.info.creationTime;
    return moment.unix(timestamp).format('D MMM YYYY H:mm:ss');
  }),

  link: computed('space', function link() {
    const {
      router,
      space,
      guiUtils,
    } = this.getProperties('router', 'space', 'guiUtils');
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      guiUtils.getRoutableIdFor(space),
      'data'
    );
  }),

  async onExecute() {
    return await this.modalManager.show('api-samples-modal', {
      record: this.space,
      apiSubject: 'space',
    }).hiddenPromise;
  },

  actions: {
    openRestApiModal() {
      this.onExecute();
    },
  },
});
