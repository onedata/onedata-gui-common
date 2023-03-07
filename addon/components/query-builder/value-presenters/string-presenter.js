/**
 * Display string value with quotes
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/query-builder/value-presenters/string-presenter';

export default Component.extend({
  layout,
  classNames: ['string-presenter'],
});
