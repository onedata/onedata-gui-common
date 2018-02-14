/**
 * Render additional information about app below onedata brand (logo)
 *
 * @module components/brand-info.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// TODO i18n

import Component from '@ember/component';

import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/brand-info';

export default Component.extend({
  layout,
  classNames: ['brand-info'],

  brandSubtitle: computed(function () {
    return 'unknown';
  }),
});
