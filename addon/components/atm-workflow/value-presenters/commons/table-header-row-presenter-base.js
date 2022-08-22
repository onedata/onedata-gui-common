/**
 * A base component for all "table header row" value presenters.
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
  classNames: ['table-header-row-presenter'],
  classNameBindings: ['typeClass'],

  /**
   * @virtual optional
   * @type {Array<string>}
   */
  columns: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @override
   */
  i18nPrefix: computed('dataSpecType', function i18nPrefix() {
    const type = this.dataSpecType ?? 'fallback';
    return `components.atmWorkflow.valuePresenters.${type}.tableHeaderRowPresenter`;
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  typeClass: computed('dataSpecType', function typeClass() {
    const type = this.dataSpecType ?? 'fallback';
    return `${dasherize(type)}-table-header-row-presenter`;
  }),
});
