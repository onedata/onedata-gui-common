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
import layout from '../templates/components/content-api-samples';

export default Component.extend(I18n, {
  layout,
  classNames: ['content-api-samples'],
  apiStringGenerator: service(),
  restApiGenerator: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentApiSamples',

  /**
   * @type {Object}
   */
  selectedApiCommand: null,

  /**
   * @type {Object}
   */
  apiSamples: undefined,

  /**
   * ID for API command info trigger (hint about API commands)
   * @type {ComputedProperty<String>}
   */
  apiCommandInfoTriggerId: tag `${'elementId'}-api-command-type-info-trigger`,

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  availableApiCommands: computed(
    'apiSamples',
    function availableApiCommands() {
      const apiSamples = this.get('apiSamples');
      let availableApiSamples = [];
      for (const [key, value] of Object.entries(apiSamples)) {
        if ('samples' in value) {
          availableApiSamples = availableApiSamples.concat(value.samples
            .map(sample => {
              if (!('type' in sample)) {
                sample.type = key;
              }
              if ('apiRoot' in value) {
                sample.apiRoot = value.apiRoot;
              }
              return sample;
            })
          );
        } else {
          availableApiSamples = availableApiSamples.concat(value
            .map(sample => {
              if (!('type' in sample)) {
                sample.type = key;
              }
              return sample;
            })
          );
        }
      }
      return availableApiSamples;
    }
  ),

  /**
   * Readonly property with valid API command specification to display.
   * Set `selectedApiCommand` property to change its value.
   * @type {ComputedProperty<Object>}
   */
  effSelectedApiCommand: conditional(
    array.includes('availableApiCommands', 'selectedApiCommand'),
    'selectedApiCommand',
    'availableApiCommands.firstObject',
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
        return apiStringGenerator.fillTemplate(command, {});
      }
    }
  ),

  actions: {
    selectApiCommand(apiCommand) {
      this.set('selectedApiCommand', apiCommand);
    },
  },
});
