/**
 * A list entry for single space in context of particular provider
 * in provider-place/drop component.
 * 
 * @module components/provider-place/drop/space
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import ProviderSpace from 'onedata-gui-common/mixins/components/provider-space';

export default Ember.Component.extend(ProviderSpace, {
  tagName: 'li',
  classNames: ['provider-place-drop-space']
});
