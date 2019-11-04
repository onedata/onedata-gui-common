/**
 * Renders inner content after first change of the triggerRender property to 
 * a truthy value.
 *
 * @module components/render-later
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import layout from '../templates/components/render-later';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * Property, which acts as a trigger for renderer. Once set to true it will
   * render inner component regardless later values of triggerRender.
   * @type {boolean}
   */
  triggerRender: false,

  /**
   * Property, which acts as a reset of render state. Once set to new value,
   * `triggerRender` will be copied directly to the `render` field.
   * @type {boolean}
   */
  resetRender: false,

  /**
   * If true then inner content is rendered.
   * @type {boolean}
   */
  render: false,

  triggerRenderObserver: observer(
    'triggerRender',
    function triggerRenderObserver() {
      const {
        triggerRender,
        render,
      } = this.getProperties('triggerRender', 'render');
      if (!render && triggerRender) {
        this.set('render', true);
      }
    }
  ),

  resetRenderObserver: observer(
    'resetRender',
    function resetRenderObserver() {
      const {
        triggerRender,
        render,
      } = this.getProperties('triggerRender', 'render');

      if (!!triggerRender !== render) {
        this.set('render', !!triggerRender);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.triggerRenderObserver();
  },

  actions: {
    resetRenderTrigger() {
      this.set('resetRender', null);
    },
  },
});
