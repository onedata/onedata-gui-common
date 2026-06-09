/**
 * A component responsible for rendering radio field.
 * It also supports an optional custom button.
 *
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/radio-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['radio-field'],

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: reads('field.preparedOptions'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  lockHint: reads('field.lockHint'),

  /**
   * @type {boolean}
   */
  hasAdditionalButton: reads('field.hasAdditionalButton'),

  /**
   * @type {SafeString}
   */
  additionalButtonName: reads('field.additionalButtonConfig.name'),

  /**
   * @type {SafeString}
   */
  additionalButtonTooltip: reads('field.additionalButtonConfig.tooltip'),

  /**
   * @type {string}
   */
  additionalButtonIcon: reads('field.additionalButtonConfig.icon'),

  additionalButtonAction: reads('field.additionalButtonConfig.buttonAction'),

  actions: {
    additionalButtonAction() {
      if (this.additionalButtonAction) {
        this.additionalButtonAction();
      }
    },
  },
});
