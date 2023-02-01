/**
 * Based on ember-spin-spinner (https://github.com/rsschermer/ember-spin-spinner)
 * Licensed under The MIT License (MIT) Copyright (c) 2014 R.S. Schermer
 *
 * @module components/spin-spinner
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { Spinner } from 'spin.js';

export default Component.extend({
  classNames: ['spin-spinner'],

  attributeBindings: ['style'],

  lines: 12,

  length: 12,

  width: 10,

  radius: 30,

  scale: 1,

  corners: 1,

  rotate: 0,

  direction: 1,

  speed: 1,

  trail: 60,

  zIndex: 'auto',

  shadow: false,

  hwaccel: false,

  color: '#333',

  left: '50%',

  top: '50%',

  style: computed('left', 'top', function () {
    return htmlSafe('position: absolute;' +
      'width: 0;' +
      'height: 0;' +
      `left: ${this.get('left')};` +
      `top: ${this.get('top')};`);
  }),

  didInsertElement() {
    const componentOptions = this.getProperties(
      'lines',
      'length',
      'width',
      'radius',
      'scale',
      'corners',
      'rotate',
      'direction',
      'speed',
      'trail',
      'zIndex',
      'shadow',
      'hwaccel',
      'color',
    );
    const spinnerOptions = Object.assign({ left: 'auto', top: 'auto' }, componentOptions);
    const spinner = new Spinner(spinnerOptions).spin(this.element);
    this.set('spinner', spinner);
  },

  willDestroyElement() {
    this.get('spinner').stop();
  },
});
