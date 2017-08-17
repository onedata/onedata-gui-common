/**
 * Display a name of some record with optional conflictLabel if available
 * 
 * Used e.g. in spaces list to distinguish spaces with the same name 
 *
 * @module components/name-conflict
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/name-conflict';

export default Ember.Component.extend({
  layout,
  tagName: '',
});
