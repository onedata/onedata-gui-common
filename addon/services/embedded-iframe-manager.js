/**
 * Controls lifecycle of attached embedded iframes according to their
 * owners list.
 *
 * @module services/embedded-iframe-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { computed, observer } from '@ember/object';
import { A } from '@ember/array';
import _ from 'lodash';
import WindowResizeHandler from 'onedata-gui-common/mixins/window-resize-handler';

export default Service.extend(WindowResizeHandler, {
  /**
   * @type {Document}
   */
  _document: document,

  /**
   * @type {Ember.ComputedProperty<HTMLElement>}
   * All iframe nodes are placed inside this element.
   */
  embeddedIframesContainer: computed(function embeddedIframesContainer() {
    return this.get('_document').querySelector('.embedded-iframes-container');
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils.EmbeddedIframe>>}
   */
  embeddedIframes: computed(() => A()),

  orphanedIframesObserver: observer(
    'embeddedIframes.@each.activeOwner',
    function orphanedIframesObserver() {
      // orphaned iframe == iframe without owner
      const embeddedIframes = this.get('embeddedIframes');
      const orphanedIframes = embeddedIframes.rejectBy('activeOwner');
      embeddedIframes.removeObjects(orphanedIframes);
      orphanedIframes.invoke('destroy');
    }
  ),

  embeddedIframesObserver: observer(
    'embeddedIframes.[]',
    function embeddedIframesObserver() {
      const {
        embeddedIframesContainer,
        embeddedIframes,
      } = this.getProperties(
        'embeddedIframesContainer',
        'embeddedIframes'
      );

      const existingIframeNodes =
        [...embeddedIframesContainer.querySelectorAll('.embedded-iframe')];
      const newIframeNodes = embeddedIframes.mapBy('iframeElement');

      // remove orphaned iframes from DOM and add just added iframes
      _.difference(existingIframeNodes, newIframeNodes)
        .forEach(iframe => iframe.remove());
      _.difference(newIframeNodes, existingIframeNodes)
        .forEach(iframe => embeddedIframesContainer.appendChild(iframe));
    }
  ),

  init() {
    this._super(...arguments);
    this.attachWindowResizeHandler();
    this.onWindowResize();
  },

  destroy() {
    try {
      this.detachWindowResizeHandler();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onWindowResize() {
    this.get('embeddedIframes').invoke('recalculatePosition');
  },
});
