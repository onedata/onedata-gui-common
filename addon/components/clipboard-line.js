/**
 * An inline input with copy to clipboard button
 *
 * @module components/clipboard-line
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/clipboard-line';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';

export default Component.extend(I18n, {
  layout,
  classNames: ['clipboard-line'],
  classNameBindings: ['size'],

  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'components.clipboardLine',

  /**
   * @virtual
   * @type {string}
   */
  value: '',

  /**
   * @virtual
   * @type {string}
   */
  label: '',

  /**
   * @virtual opional
   * @type {string}
   */
  size: undefined,

  /**
   * Override this to get custom notifications like: "<textType> successfully copied..."
   * @type {Ember.ComputedProperty<string>|string}
   */
  textType: computed(function () {
    return this.t('defaultTextType');
  }),

  actions: {
    copySuccess() {
      this.get('globalNotify').info(this.t(
        'copySuccess', {
          textType: _.startCase(this.get('textType')),
        }
      ));
    },

    copyError() {
      this.get('globalNotify').info(this.t(
        'copyError', {
          textType: this.get('textType'),
        }
      ));
    },
  },
});
