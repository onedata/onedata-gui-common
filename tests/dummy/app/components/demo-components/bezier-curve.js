/**
 * @module components/demo-components/bezier-curve
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { htmlSafe } from '@ember/string';

export default Component.extend({
  tagName: 'svg',
  classNames: 'draw-area',
  attributeBindings: ['xmlns'],
  xmlns: htmlSafe('http://www.w3.org/2000/svg'),

  x2: 200,
  y2: 200,

  click(clickEvent) {
    this.setProperties({
      x2: clickEvent.offsetX,
      y2: clickEvent.offsetY,
    });
  },
});
