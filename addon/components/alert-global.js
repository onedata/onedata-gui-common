/**
 * A singleton component that is used by ``alert`` service.
 *
 * Place it in application template.
 *
 * @module components/alert-global
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
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

const expandDetailsLinkClasses = {
  error: 'text-danger',
  warning: 'text-warning',
  info: '',
  default: '',
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
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.alertGlobal',

  /**
   * @type {boolean}
   */
  areDetailsExpanded: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  open: reads('alert.opened'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  type: reads('alert.type'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  text: reads('alert.text'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  detailsText: reads('alert.detailsText'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  alwaysShowDetails: reads('alert.alwaysShowDetails'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  options: reads('alert.options'),

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
  expandDetailsLinkClass: computed('alert.type', function expandDetailsLinkClass() {
    const alertType = this.get('alert.type');
    return expandDetailsLinkClasses[alertType] ||
      expandDetailsLinkClasses['default'];
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  closeBtnClass: computed('alert.type', function closeBtnClass() {
    const alertType = this.get('alert.type');
    return (closeBtnClasses[alertType] || closeBtnClasses['default']) +
      ' close-alert-modal';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  icon: computed('alert.type', function icon() {
    const alertType = this.get('alert.type');
    return icons[alertType] || icons['default'];
  }),

  actions: {
    toggleDetails() {
      this.toggleProperty('areDetailsExpanded');
    },
    onHide() {
      this.set('alert.opened', false);
    },
  },
});
