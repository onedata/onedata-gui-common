/**
 * Renders just a HTML element.
 * 
 * Can be used for example for yielding a simple element as a component from template.
 *
 * @module components/one-element
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-element';

export default Component.extend({
  layout,
});
