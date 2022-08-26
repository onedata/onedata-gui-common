/**
 * A "full" value presenter component, which is able to present any type of
 * data using switchable raw and visual presenters.
 *
 * NOTE: Some data types don't have a dedicated visual presenter. In such case
 * only a raw presenter is available for a user.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { bool, conditional, eq, raw } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/full-value-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  getRawValuePresenter,
  getVisualValuePresenter,
} from 'onedata-gui-common/utils/atm-workflow/value-presenters';

export default Component.extend(I18n, {
  classNames: ['full-value-presenter'],
  layout,

  i18n: service(),
  globalClipboard: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.fullValuePresenter',

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
   * @type {'visual'|'raw'}
   */
  presenterType: undefined,

  /**
   * @type {ComputedProperty<string|null>}
   */
  visualPresenterComponent: computed(
    'dataSpec',
    function visualPresenterComponent() {
      return getVisualValuePresenter(this.dataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  rawPresenterComponent: computed(
    'dataSpec',
    function visualPresenterComponent() {
      return getRawValuePresenter(this.dataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  currentPresenterComponent: conditional(
    eq('presenterType', raw('visual')),
    'visualPresenterComponent',
    'rawPresenterComponent'
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isPresenterTypeToggleEnabled: bool('visualPresenterComponent'),

  init() {
    this._super(...arguments);
    this.set('presenterType', this.visualPresenterComponent ? 'visual' : 'raw');
  },

  actions: {
    presenterTypeChange(type) {
      this.set('presenterType', type);
    },
    copyJson() {
      this.globalClipboard.copy(JSON.stringify(this.value, null, 2));
    },
  },
});
