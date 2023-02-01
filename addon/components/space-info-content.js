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
import { promise } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { reportFormatter } from 'onedata-gui-common/helpers/date-format';

export default Component.extend(I18n, {
  layout,
  classNames: ['space-info-content'],

  userManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceInfoContent',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showLinkToRestApiModal: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showLinkToFileBrowser: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showLinkToSpace: false,

  /**
   * @virtual optional
   * @type {string}
   */
  linkToFileBrowser: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  linkToSpace: undefined,

  /**
   * @virtual optional
   * @type {function}
   */
  onOpenRestApiModal: undefined,

  /**
   * @virtual optional
   * @type {function}
   */
  closeSpaceInfoPopover: undefined,

  /**
   * @type {PromiseObject<Models.User>}
   */
  creatorProxy: promise.object(computed(
    'space.info.creatorId',
    async function creatorProxy() {
      if (this.space.info?.creatorId) {
        return this.userManager.getRecordById(this.space.info.creatorId);
      }
    }
  )),

  /**
   * @type {Models.User}
   */
  creator: reads('creatorProxy.content'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  creationTime: computed('space.info.creationTime', function creationTime() {
    const timestamp = this.space.info?.creationTime;
    if (timestamp) {
      return moment.unix(timestamp).format(reportFormatter);
    }
  }),

  actions: {
    openRestApiModal() {
      this.closeSpaceInfoPopover?.();
      this.onOpenRestApiModal?.();
    },
  },
});
