/**
 * Button component with API based on ember-bootstrap button.
 *
 * @module components/one-button
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsButton from 'ember-bootstrap/components/bs-button';
import layout from '../templates/components/one-button';
import { computed } from '@ember/object';
import { or, eq, raw, and } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';

const spinnerScalesConfig = {
  sm: 0.15,
  md: 0.24,
  lg: 0.26,
};

export default BsButton.extend({
  layout,
  classNames: ['one-button'],
  attributeBindings: ['isEffDisabled:disabled'],

  /**
   * @virtual optional
   * @type {boolean}
   */
  disableWhenPending: true,

  /**
   * @type {Object<string, number>}
   */
  spinnerScalesConfig,

  /**
   * @type {ComputedProperty<number>}
   */
  spinnerScale: computed('spinnerScalesConfig', 'size', function spinnerScale() {
    const {
      spinnerScalesConfig,
      size,
    } = this.getProperties('spinnerScalesConfig', 'size');

    return spinnerScalesConfig[size] || spinnerScalesConfig.md;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInPendingState: or('isPending', eq('textState', raw('pending'))),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSpinnerVisible: reads('isInPendingState'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEffDisabled: or('disabled', and('isInPendingState', 'disableWhenPending')),
});
