/**
 * A base component for all "single line" value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { dasherize } from '@ember/string';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/commons/single-line-presenter-base';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: 'span',
  layout,
  classNames: ['single-line-presenter'],
  classNameBindings: ['typeClass'],

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
   * @type {AtmDataSpecType}
   */
  dataSpecType: undefined,

  /**
   * @override
   */
  i18nPrefix: computed('dataSpecType', function i18nPrefix() {
    const type = this.dataSpecType ?? 'fallback';
    return `components.atmWorkflow.valuePresenters.${type}.singleLinePresenter`;
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  typeClass: computed('dataSpecType', function typeClass() {
    const type = this.dataSpecType ?? 'fallback';
    return `${dasherize(type)}-single-line-presenter`;
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedValue: computed('value', function stringifiedValue() {
    return JSON.stringify(this.value);
  }),
});
