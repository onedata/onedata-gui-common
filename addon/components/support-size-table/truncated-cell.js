/**
 * A component that is used as a cell renderer with autotruncate functionality.
 *
 * @module components/space-support-table/truncated-cell
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/support-size-table/truncated-cell';

export default Ember.Component.extend({
  layout,
  tagName: '',
});
