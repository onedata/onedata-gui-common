import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-image';
import dom from 'onedata-gui-common/utils/dom';

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
 * @author Michał Borzęcki
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
    if (this.imageText) {
      // 10% of image width
      const image = this.element.querySelector('.image');
      if (image) {
        const fontSize = dom.width(image) * 0.10;
        dom.setStyle(this.element, 'fontSize', `${fontSize}px`);
      }
    }
  },
});
