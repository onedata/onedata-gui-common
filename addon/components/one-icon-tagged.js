/**
 * An icon with addtional icon in the corner (eg. with x).
 * See dummy app for examples.
 * 
 * @module components/one-icon-tagged
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-icon-tagged';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['one-icon-tagged'],
  icon: undefined,
  tagIcon: 'x',
  shadowType: 'circle',
  shadowIcon: reads('tagIcon'),
});
