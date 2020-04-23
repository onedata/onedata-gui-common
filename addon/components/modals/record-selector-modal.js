/**
 * A modal that allows to select record from passed collection. Data needed from
 * modalOptions:
 * - recordsPromise - promise, which resolves to an array of records
 * - headerText - modal header text
 * - descriptionText - (optional) description rendered above the selector
 * - selectorPlaceholderText - (optional) selector placeholder
 * - submitText - submit button text
 * 
 * @module components/modals/record-selector-modal
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promise } from 'ember-awesome-macros';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import RecordOptionsArrayProxy from 'onedata-gui-common/utils/record-options-array-proxy';
import { resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import layout from '../../templates/components/modals/record-selector-modal';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.recordSelectorModal',

  /**
   * @virtual
   */
  modalOptions: undefined,

  /**
   * @type {FieldOption}
   */
  selectedRecordOption: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: reads('modalOptions.headerText'),

  /**
   * @type {ComputedProperty<String>}
   */
  descriptionText: reads('modalOptions.descriptionText'),

  /**
   * @type {ComputedProperty<String>}
   */
  selectorPlaceholderText: reads('modalOptions.selectorPlaceholderText'),

  /**
   * @type {ComputedProperty<String>}
   */
  submitText: reads('modalOptions.submitText'),

  /**
   * @type {ComputedProperty<Promise<Array<GraphSingleModel>>>}
   */
  recordsPromise: reads('modalOptions.recordsPromise'),

  /**
   * @type {ComputedProperty<ArrayProxy<FieldOption>>}
   */
  recordOptionsProxy: promise.array(computed(
    'recordsPromise',
    function recordsOptions() {
      const recordsPromise = this.get('recordsPromise') || resolve([]);

      return recordsPromise
        .then(records => RecordOptionsArrayProxy.create({
          ownerSource: this,
          records,
        }));
    }
  )),

  recordOptionsProxyObserver: observer(
    'recordOptionsProxy.[]',
    function recordOptionsProxyObserver() {
      const {
        selectedRecordOption,
        recordOptionsProxy,
      } = this.getProperties('selectedRecordOption', 'recordOptionsProxy');

      const records = recordOptionsProxy.mapBy('value');
      const selectedRecord = selectedRecordOption ?
        get(selectedRecordOption, 'value') : null;

      if (selectedRecord && !records.includes(selectedRecord)) {
        this.set('selectedRecordOption', undefined);
      }
    }
  ),

  actions: {
    submit(submitCallback) {
      const selectedRecord = this.get('selectedRecordOption.value');

      this.set('isSubmitting', true);
      return resolve(submitCallback(selectedRecord))
        .finally(() => safeExec(this, () => this.set('isSubmitting', false)));
    },
  },
});
