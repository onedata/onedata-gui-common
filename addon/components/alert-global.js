/**
 * A singleton component that is used by ``alert`` service.
 *
 * Place it in application template.
 *
 * @module components/alert-global
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/alert-global';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const icons = {
  error: 'sign-error-rounded',
  warning: 'sign-warning-rounded',
  info: 'sign-info-rounded',
  default: 'sign-info-rounded',
};

const headerTranslations = {
  error: 'error',
  warning: 'warning',
  info: 'notice',
  default: 'notice',
};

const closeBtnClasses = {
  error: 'btn-danger',
  warning: 'btn-warning',
  info: 'btn-default',
  default: 'btn-default',
};

export default Component.extend(I18n, {
  layout,
  alert: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.alertGlobal',

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  open: readOnly('alert.opened'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  text: readOnly('alert.text'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  header: computed('alert.type', function header() {
    const alertType = this.get('alert.type');
    const translationName = headerTranslations[alertType] ||
      headerTranslations['default'];
    return this.tt(translationName);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  closeBtnClass: computed('alert.type', function closeBtnClass() {
    const alertType = this.get('alert.type');
    return closeBtnClasses[alertType] || closeBtnClasses['default'];
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  icon: computed('alert.type', function icon() {
    const alertType = this.get('alert.type');
    return icons[alertType] || icons['default'];
  }),

  actions: {
    onHide() {
      this.set('alert.opened', false);
    },
  }
});
