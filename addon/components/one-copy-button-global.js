/**
 * Global component for copying to clipboard.
 *
 * @module components/one-copy-button-global
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import CopyButton from 'ember-cli-clipboard/components/copy-button';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import { or } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';

export default CopyButton.extend(I18n, {
  globalClipboard: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   * Use translation from one-copy-button component
   */
  i18nPrefix: 'components.oneCopyButton',

  /**
   * @override
   */
  classNames: ['hidden', 'btn-global-copy-button'],

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clipboardText: reads('globalClipboard.textToCopy'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  textType: or('globalClipboard.textType', computedT('defaultTextType')),

  /**
   * @override
   * @type {Ember.ComputedProperty<function>}
   */
  success: computed(function success() {
    return this._success.bind(this);
  }),

  /**
   * @override
   * @type {Ember.ComputedProperty<function>}
   */
  error: computed(function error() {
    return this._error.bind(this);
  }),

  _success() {
    const {
      globalNotify,
      textType,
    } = this.getProperties('globalNotify', 'textType');
    globalNotify.success(this.t(
      'copySuccess', {
        textType: _.startCase(textType),
      }
    ));
  },

  _error() {
    const {
      globalNotify,
      textType,
    } = this.getProperties('globalNotify', 'textType');
    globalNotify.error(this.t(
      'copyFailure', {
        textType: textType,
      }
    ));
  },
});
