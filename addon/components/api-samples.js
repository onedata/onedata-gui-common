/**
 * Renders api samples content.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { conditional, array, tag } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import layout from '../templates/components/api-samples';

export default Component.extend(I18n, {
  layout,
  classNames: ['api-samples'],

  apiStringGenerator: service(),
  restApiGenerator: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.apiSamples',

  /**
   * @virtual
   * @type {Object}
   */
  apiSamples: undefined,

  /**
   * @type {Object}
   */
  selectedApiCommand: null,

  /**
   * ID for API command info trigger (hint about API commands)
   * @type {ComputedProperty<String>}
   */
  apiCommandInfoTriggerId: tag `${'elementId'}-api-command-type-info-trigger`,

  /**
   * Readonly property with valid API command specification to display.
   * Set `selectedApiCommand` property to change its value.
   * @type {ComputedProperty<Object>}
   */
  effSelectedApiCommand: conditional(
    array.includes('apiSamples', 'selectedApiCommand'),
    'selectedApiCommand',
    'apiSamples.firstObject',
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  description: reads('effSelectedApiCommand.description'),

  /**
   * @type {ComputedProperty<String>}
   */
  selectedApiCommandString: computed(
    'effSelectedApiCommand',
    function selectedApiCommandString() {
      const effSelectedApiCommand = this.get('effSelectedApiCommand');
      const type = get(effSelectedApiCommand, 'type');

      if (type === 'rest') {
        const restApiGenerator = this.get('restApiGenerator');
        return restApiGenerator.generateSample(effSelectedApiCommand);
      } else {
        const apiStringGenerator = this.get('apiStringGenerator');
        const command = get(effSelectedApiCommand, 'command');
        return apiStringGenerator.fillTemplate(command);
      }
    }
  ),

  actions: {
    selectApiCommand(apiCommand) {
      this.set('selectedApiCommand', apiCommand);
    },
  },
});
