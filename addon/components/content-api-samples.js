/**
 * Renders api samples entry.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { conditional, promise, array, tag } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import layout from '../templates/components/content-api-samples';

export default Component.extend(I18n, {
  layout,
  classNames: ['content-api-samples'],
  fileManager: service(),
  apiStringGenerator: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.fileBrowser.fbInfoModal.apiEntry',

  /**
   * @virtual
   * @type {Models.File}
   */
  file: undefined,

  selectedApiCommand: null,

  /**
   * For available values see: `commonRestUrlTypes` and `availableRestUrlCommands`
   * @type {String}
   */
  selectedRestUrlType: null,

  apiSamplesProxy: promise.object(computed(function apiSamples() {
    const fileId = this.get('file.entityId');
    return this.get('fileManager').getFileApiSamples(fileId, 'public');
  })),

  apiSamples: reads('apiSamplesProxy.content'),

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
              sample.type = key;
              if ('apiRoot' in value) {
                sample.apiRoot = value.apiRoot;
              }
              return sample;
            }));
        } else {
          availableApiSamples = availableApiSamples.concat(value
            .map(sample => {
              sample.type = key;
              return sample;
            }));
        }
      }
      return availableApiSamples;
    }
  ),

  /**
   * Readonly property with valid API command specification to display.
   * Set `selectedApiComman` property to change its value.
   * @type {ComputedProperty<Object>}
   */
  effSelectedApiCommand: conditional(
    array.includes('availableApiCommands', 'selectedApiCommand'),
    'selectedApiCommand',
    'availableApiCommands.firstObject',
  ),

  /**
   * Readonly property with valid name of REST URL type to display.
   * Set `selectedRestUrlType` property to change its value.
   * @type {ComputedProperty<String>}
   */
  effSelectedRestUrlType: conditional(
    array.includes('availableRestUrlCommands', 'selectedRestUrlType'),
    'selectedRestUrlType',
    'availableRestUrlCommands.firstObject',
  ),
  // TODO czy to potrzebne?
  description: reads('effSelectedApiCommand.description'),

  /**
   * @type {ComputedProperty<String>}
   */
  selectedApiCommandString: computed(
    'effSelectedApiCommand',
    'spaceId',
    'share',
    'filePath',
    function selectedApiCommandString() {
      const {
        effSelectedApiCommand,
      } = this.getProperties(
        'effSelectedApiCommand',
      );
      const type = get(effSelectedApiCommand, 'type');
      const apiStringGenerator = this.get('apiStringGenerator');
      if (type === 'rest') {
        const method = get(effSelectedApiCommand, 'method');
        const path = get(effSelectedApiCommand, 'apiRoot') + get(effSelectedApiCommand, 'path');
        const redirect = get(effSelectedApiCommand, 'followRedirects') ? '-L' : '';
        return apiStringGenerator.fillTemplate(['curl', '{redirect}', '-X', '{method}', '{path}'], {
          method,
          path,
          redirect,
        });
      } else {
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
