/**
 * A message to display in place of some resource cannot be loaded. 
 *
 * @module components/resource-load-error
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/resource-load-error';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['alert', 'alert-promise-error', 'resource-load-error'],
  classNameBindings: ['type', 'alertType'],

  i18n: service(),
  errorExtractor: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.resourceLoadError',

  /**
   * Action to invoke on alert panel close.
   * If not null - show a close button in alert panel.
   * @type {function|undefined}
   */
  onClose: undefined,

  /**
   * Displayed error details generated from reason error object
   * @type {string}
   */
  _reasonDetails: computed('reason', function () {
    const {
      reason,
      errorExtractor,
    } = this.getProperties('reason', 'errorExtractor');
    return errorExtractor.getMessage(reason);
  }),

  /**
   * Error type generated from reason error object
   * @type {string}
   */
  type: computed('reason', function () {
    const {
      reason,
      errorExtractor,
    } = this.getProperties('reason', 'errorExtractor');
    return errorExtractor.getType(reason);
  }),

  /**
   * Alert type
   * @type {string}
   */
  alertType: computed('type', function () {
    return this.get('type') !== 'error' ? 'alert-warning' : 'alert-danger';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  defaultMessage: computed('type', function () {
    const type = this.get('type');
    return this.t(
      type === 'forbidden' ? 'defaultForbiddenMessage' : 'defaultErrorMessage'
    );
  }),

  init() {
    this._super(...arguments);
    if (!this.get('message')) {
      this.set('message', this.get('defaultMessage'));
    }
  },

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
    close() {
      this.get('onClose')();
    }
  }
});
