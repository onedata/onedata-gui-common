/**
 * Display value as-is, without additional formatting
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/query-builder/value-presenters/raw-presenter';

export default Component.extend({
  layout,
  classNames: ['raw-presenter'],
});
