/**
 * Redirect to Onepanel GUI (hosted on Onezone domain) on component load
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import { onepanelAbbrev } from 'onedata-gui-common/utils/onedata-urls';
import { or } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/content-clusters-onepanel-redirect';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

/**
 * @typedef {Object} ClusterModel
 * @property {string} type
 * @property {string} domain
 * @property {string} [entityId] id of cluster
 * @property {string} [id] id of cluster used if entityId is not defined
 */

export default Component.extend({
  layout,
  classNames: ['content-clusters-onepanel-redirect'],

  /**
   * @virtual
   * @type {ClusterModel} cluster item
   */
  cluster: undefined,

  /**
   * @virtual
   */
  openClusterErrorInOnezone: notImplementedReject,

  clusterId: or('cluster.entityId', 'cluster.id'),

  clusterType: reads('cluster.type'),

  onepanelHref: computed(
    'clusterId',
    'aspect',
    function onepanelHref() {
      const {
        clusterId,
        aspect,
      } = this.getProperties('clusterId', 'aspect');
      let href =
        `${location.origin}/${onepanelAbbrev}/${clusterId}/i#/onedata/clusters/${clusterId}`;
      if (aspect) {
        href += `/${aspect}`;
      }
      return href;
    }),

  redirectProxy: computed('cluster.domain', function redirectProxy() {
    return PromiseObject.create({ promise: this.redirectToOnepanel() });
  }),

  checkOnepanelAvailability() {
    return this.get('cluster').updateIsOnlineProxy();
  },

  redirectToOnepanelApp() {
    window.location.replace(this.get('onepanelHref'));
  },

  redirectToOnepanel() {
    return this.checkOnepanelAvailability()
      .then(isAvailable => {
        if (isAvailable) {
          return new Promise((resolve, reject) => {
            try {
              this.redirectToOnepanelApp();
            } catch (error) {
              reject(error);
            }
          });
        } else {
          return this.openClusterErrorInOnezone();
        }
      });
  },
});
