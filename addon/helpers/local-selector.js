/**
 * Helps generating selector for current component 
 *
 * @module helpers/local-selector
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export function localSelector([elementId, origSelector]) {
  return `#${elementId} ${origSelector}`;
}

export default Ember.Helper.helper(localSelector);
