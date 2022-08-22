/**
 * Shows single value container content (or error if value is unavailable).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/value-container-presenter';

export default Component.extend({
  layout,
  classNames: ['value-container-presenter'],
  classNameBindings: ['valueContainer.success:success:error'],

  /**
   * @virtual
   * @type {AtmValueContainer}
   */
  valueContainer: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,
});
