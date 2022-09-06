/**
 * A base component for all "table body row" value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { dasherize } from '@ember/string';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['table-body-row-presenter'],
  classNameBindings: ['typeClass'],
  attributeBindings: ['dataRowId:data-row-id'],

  /**
   * @virtual
   * @type {unknown}
   */
  value: undefined,

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

  /**
   * @virtual optional
   * @type {Array<string>}
   */
  columns: undefined,

  /**
   * Value for `data-row-id` attribute (used by infinite scroll).
   * @virtual optional
   * @type {string}
   */
  dataRowId: undefined,

  /**
   * @virtual optional
   * @type {AtmDataSpecType}
   */
  dataSpecType: undefined,

  /**
   * @override
   */
  i18nPrefix: computed('dataSpecType', function i18nPrefix() {
    const type = this.dataSpecType ?? 'fallback';
    return `components.atmWorkflow.valuePresenters.${type}.tableBodyRowPresenter`;
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  typeClass: computed('dataSpecType', function typeClass() {
    const type = this.dataSpecType ?? 'fallback';
    return `${dasherize(type)}-table-body-row-presenter`;
  }),
});
