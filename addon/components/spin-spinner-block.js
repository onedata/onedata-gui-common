/**
 * A container with spin-spinner.
 *
 * Facilitates positioning and setting size of spinner.
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/spin-spinner-block';

const PREDEF_SIZES = {
  xxs: 0.12,
  xs: 0.2,
  sm: 0.4,
  md: 0.8,
  lg: 1.2,
};

export default Component.extend({
  layout,
  tagName: 'div',
  classNames: ['spin-spinner-block', 'spinner-container'],
  classNameBindings: ['sizeClass'],

  sizeClass: 'lg',

  spinnerScale: computed('sizeClass', function () {
    return PREDEF_SIZES[this.get('sizeClass')];
  }),
});
