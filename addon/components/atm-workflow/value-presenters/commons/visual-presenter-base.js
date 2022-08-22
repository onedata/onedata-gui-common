/**
 * A base component for all "visual" value presenters.
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
  classNames: ['visual-presenter'],
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
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @virtual optional
   * @type {AtmDataSpecType}
   */
  dataSpecType: undefined,

  /**
   * If set to true, then this component is a top presenter component (has no
   * parent presenters).
   * @virtual optional
   * @type {boolean}
   */
  isRootPresenter: true,

  /**
   * @override
   */
  i18nPrefix: computed('dataSpecType', function i18nPrefix() {
    const type = this.dataSpecType ?? 'fallback';
    return `components.atmWorkflow.valuePresenters.${type}.visualPresenter`;
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  typeClass: computed('dataSpecType', function typeClass() {
    const type = this.dataSpecType ?? 'fallback';
    return `${dasherize(type)}-visual-presenter`;
  }),
});
