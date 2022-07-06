import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-image';
import $ from 'jquery';

/**
 * Inserts an image with optional - dynamicly sized - text.
 * Typical usage:
 * ```
 * {{one-image
 *   imagePath='some/image.png'
 *   imageText='some text'
 *   imageTextClass='classForTextElement'
 * }}
 * ```
 *
 * @module components/one-image
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  classNames: ['one-image'],

  /**
   * Path to an image file
   * @type {string}
   */
  imagePath: null,

  /**
   * Text, that will be placed with the image
   * @type {string}
   */
  imageText: '',

  /**
   * CSS class for text element. It should handle with positioning if neccessary.
   * @type {string}
   */
  imageTextClass: '',

  _onResizeHandler: null,

  init() {
    this._super(...arguments);
    this.set('_onResizeHandler', () => this._recalculateImageFontSize());
  },

  didInsertElement() {
    this._super(...arguments);
    const {
      _onResizeHandler,
      element,
    } = this.getProperties('_onResizeHandler', 'element');

    window.addEventListener('resize', _onResizeHandler);
    element.querySelector('.image').addEventListener('load', _onResizeHandler);
  },

  willDestroyElement() {
    this._super(...arguments);
    window.removeEventListener('resize', this.get('_onResizeHandler'));
  },

  _recalculateImageFontSize() {
    const {
      element,
      imageText,
    } = this.getProperties('element', 'imageText');
    if (imageText) {
      // 10% of image width
      const $image = $(element.querySelector('.image'));
      if ($image.length) {
        const fontSize = $image.width() * 0.10;
        element.style.fontSize = `${fontSize}px`;
      }
    }
  },
});
