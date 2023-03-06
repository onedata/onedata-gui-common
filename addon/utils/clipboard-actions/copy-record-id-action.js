/**
 * Copies id of record passed via context to the clipboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { computed, set, setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';
import { or } from 'ember-awesome-macros';

export default Action.extend({
  globalClipboard: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.clipboardActions.copyRecordIdAction',

  /**
   * @override
   */
  className: 'copy-record-id-action-trigger',

  /**
   * @override
   */
  icon: 'copy',

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  record: reads('context.record'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  modelName: reads('record.constructor.modelName'),

  /**
   * @type {ComputedProperty<SafeString|null>}
   */
  modelNameTranslation: computed('modelName', function modelNameTranslation() {
    const modelName = this.get('modelName');
    if (!modelName) {
      return null;
    }

    return this.t(`common.modelNames.${camelize(modelName)}`, {}, {
      usePrefix: false,
      defaultValue: null,
    });
  }),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  recordId: or('record.entityId', 'record.id'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  clipboardContentTypeTranslation: computed(
    'modelNameTranslation',
    function clipboardContentTypeTranslation() {
      const modelNameTranslation = this.get('modelNameTranslation');
      return modelNameTranslation ?
        this.t('clipboardContentType.withModelName', { modelName: modelNameTranslation }) :
        this.t('clipboardContentType.withoutModelName');
    }
  ),

  /**
   * @override
   */
  onExecute() {
    const {
      recordId,
      globalClipboard,
      clipboardContentTypeTranslation,
    } = this.getProperties(
      'recordId',
      'globalClipboard',
      'clipboardContentTypeTranslation'
    );

    const result = ActionResult.create();
    if (!recordId) {
      set(result, 'status', 'failed');
      return result;
    }

    try {
      globalClipboard.copy(recordId, clipboardContentTypeTranslation);
      set(result, 'status', 'done');
    } catch (error) {
      setProperties(result, {
        status: 'failed',
        error,
      });
    }
    return result;
  },
});
