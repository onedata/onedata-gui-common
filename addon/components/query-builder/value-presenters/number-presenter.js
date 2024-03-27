/**
 * Display formatted number value
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/query-builder/value-presenters/number-presenter';

export default Component.extend({
  layout,
  classNames: ['number-presenter'],
});
