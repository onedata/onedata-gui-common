/**
 * A tile, container for small summary of some aspect used mainly in overviews
 * 
 * Put them in `.one-tile-container` div.
 * Set `aspect` property for use as a link.
 *
 * @module components/one-tile
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-tile';

import { inject as service } from '@ember/service';
import { and } from '@ember/object/computed';

export default Component.extend({
  layout,
  classNames: ['one-tile'],
  classNameBindings: ['isLink:one-tile-link'],

  router: service(),

  /**
   * If set, the tile will be a link to some aspect of currently loaded resource
   * @type {string}
   */
  aspect: undefined,

  /**
   * If true, whole tile is a pseudo-link to aspect.
   * If false, only the "more" anchor will be a link.
   * @type {boolean}
   */
  isLink: true,

  _isLink: and('isLink', 'aspect'),

  init() {
    this._super(...arguments);
    if (this.get('_isLink')) {
      this.click = function click() {
        const {
          router,
          aspect,
        } = this.getProperties('router', 'aspect');
        router.transitionTo('onedata.sidebar.content.aspect', aspect);
      }
    }
  },

});
