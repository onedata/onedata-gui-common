/**
 * Content of popup with information about harvester
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import layout from '../templates/components/harvester-info-content';
import { promise } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { reportFormatter } from 'onedata-gui-common/helpers/date-format';

export default Component.extend(I18n, {
  layout,
  classNames: ['harvester-info-content'],

  router: service(),
  guiUtils: service(),
  userManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterInfoContent',

  /**
   * @virtual
   * @type {Models.Harvester}
   */
  record: undefined,

  /**
   * @type {Location}
   */
  _location: location,

  /**
   * @type {PromiseObject<Models.User>}
   */
  creatorProxy: promise.object(computed(
    'record.info.creatorId',
    async function creatorProxy() {
      if (this.record.info?.creatorId) {
        return this.userManager.getRecordById(this.record.info.creatorId);
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
  creationTime: computed('record.info.creationTime', function creationTime() {
    const timestamp = this.record.info?.creationTime;
    if (timestamp) {
      return moment.unix(timestamp).format(reportFormatter);
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  publicUrl: computed('record.entityId', function publicUrl() {
    if (this.record.entityId) {
      return this._location.origin + this._location.pathname +
        this.router.urlFor('public.harvesters', this.record.entityId);
    } else {
      return null;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  linkToHarvester: computed('record', function linkToHarvester() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'harvesters',
      this.guiUtils.getRoutableIdFor(this.record),
      'plugin'
    );
  }),
});
