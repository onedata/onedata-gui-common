/**
 * Dummy component, that can be used for testing purposes. Component instance
 * is available via `this.$('.test-component')[0].componentInstance`. Then
 * you can use it like: `get(componentInstance, 'injectedCallback')(someData)`
 * to simulate injected callback execution.
 * 
 * @module components/test-component
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/test-component';

export default Component.extend({
  layout,
  classNames: ['test-component'],

  didInsertElement() {
    this._super(...arguments);

    this.get('element').componentInstance = this;
  },
});
