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
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { capitalize } from '@ember/string';
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
   * @virtual optional
   * @type {string | undefined}
   */
  clipboardText: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  notify: notImplementedIgnore,

  /**
   * Global clipboard target selector for local element selector
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  clipboardTarget: computed(
    'parentElementId',
    'localTarget', {
      get() {
        if (this.injectedClipboardTarget) {
          return this.injectedClipboardTarget;
        } else if (this.parentElementId && this.localTarget) {
          return `#${this.parentElementId} ${this.localTarget}`;
        }
      },
      set(key, value) {
        return this.injectedClipboardTarget = value;
      },
    }
  ),

  /**
   * Override this to get custom notifications like: "<textType> successfully copied..."
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  textType: computed({
    get() {
      return this.injectedTextType ?? this.t('defaultTextType');
    },
    set(key, value) {
      return this.injectedTextType = value ?? this.t('defaultTextType');
    },
  }),

  /**
   * @type {string | null}
   */
  injectedClipboardTarget: null,

  /**
   * @type {string | null}
   */
  injectedTextType: null,

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
    this.globalNotify.info(this.t(
      'copySuccess', {
        textType: capitalize(String(this.textType)),
      }
    ));
    this.notify?.(true);
  },

  _error() {
    this.globalNotify.info(this.t(
      'copyFailure', {
        textType: this.get('textType'),
      }
    ));
    this.notify?.(false);
  },
});
