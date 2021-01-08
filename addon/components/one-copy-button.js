/**
 * Facilitates usage of copy-button in Onedata front-ends.
 * 
 * Example usage:
 * 
 * ```
 * {{#one-copy-button
 *   class="btn btn-primary"
 *   parentElementId=elementId
 *   localTarget=".clipboard-input"
 * }}
 * ```
 * 
 * Will render button with default copy icon and label that will copy contents
 * of `.clipboard-input` input/textarea found in current component.
 * 
 * @module components/one-copy-button
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/one-copy-button';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18nPrefix: 'components.oneCopyButton',

  globalNotify: service(),
  i18n: service(),

  /**
   * @virtual
   * elementId of the component that uses this one-copy-button
   * @type {string}
   */
  parentElementId: undefined,

  /**
   * @virtual
   * Selector of input that is placed in the component that uses this one-copy-button
   * @type {string} jQuery selector
   */
  localTarget: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  notify: notImplementedIgnore,

  /**
   * @virtual
   * @type {String}
   */
  copyButtonTagName: 'button',

  /**
   * Computes global clipboard target selector for local element selector
   * @type {Ember.ComputedProperty<function>}
   */
  clipboardTarget: computed(
    'parentElementId',
    'localTarget',
    function clipboardTarget() {
      const {
        parentElementId,
        localTarget,
      } = this.getProperties('parentElementId', 'localTarget');
      return `#${parentElementId} ${localTarget}`;
    }
  ),

  /**
   * Override this to get custom notifications like: "<textType> successfully copied..."
   * @type {Ember.ComputedProperty<string>|string}
   */
  textType: computed(function textType() {
    return this.t('defaultTextType');
  }),

  /**
   * @type {Ember.ComputedProperty<function>}
   */
  success: computed(function success() {
    return this._success.bind(this);
  }),

  /**
   * @type {Ember.ComputedProperty<function>}
   */
  error: computed(function error() {
    return this._error.bind(this);
  }),

  _success() {
    this.get('notify')(true);
    this.get('globalNotify').info(this.t(
      'copySuccess', {
        textType: _.startCase(this.get('textType')),
      }
    ));
  },

  _error() {
    this.get('notify')(false);
    this.get('globalNotify').info(this.t(
      'copyError', {
        textType: this.get('textType'),
      }
    ));
  },

});
